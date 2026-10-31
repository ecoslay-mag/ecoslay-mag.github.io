#!/usr/bin/env python3
import os
import subprocess
import sys
from PIL import Image
import numpy as np

CHROME = "google-chrome"
OUT = "/tmp/opencode/smoke-verify"
BASE = "http://localhost:8000/"
TIMES = [5000, 6000, 7000]
os.makedirs(OUT, exist_ok=True)

def capture(url, vt, path):
    cmd = [
        CHROME, "--headless=new", "--enable-unsafe-swiftshader",
        f"--virtual-time-budget={vt}", f"--screenshot={path}", url,
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=40)
    if not os.path.exists(path):
        raise RuntimeError(f"Chrome did not create {path}")

def largest_component(mask):
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    best = 0
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not seen[y, x]:
                stack = [(y, x)]
                seen[y, x] = True
                area = 0
                while stack:
                    cy, cx = stack.pop()
                    area += 1
                    for ny, nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny,nx] and not seen[ny,nx]:
                            seen[ny,nx] = True
                            stack.append((ny,nx))
                best = max(best, area)
    return best

def analyze(normal_path, base_path):
    a = np.array(Image.open(normal_path).convert("RGB"), dtype=np.float32)
    b = np.array(Image.open(base_path).convert("RGB"), dtype=np.float32)
    diff = np.linalg.norm(a - b, axis=2)
    mask = diff > 8.0
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return None
    y0, y1 = ys.min(), ys.max()
    x0, x1 = xs.min(), xs.max()
    bbox = mask[y0:y1+1, x0:x1+1]
    area = bbox.size
    coverage = float(bbox.mean())
    gap = largest_component(~bbox) / area

    # Connected components in the full mask bbox for oval detection.
    comp_seen = np.zeros_like(bbox, dtype=bool)
    ovals = []
    for y in range(bbox.shape[0]):
        for x in range(bbox.shape[1]):
            if bbox[y, x] and not comp_seen[y, x]:
                stack = [(y, x)]
                comp_seen[y, x] = True
                pts = []
                while stack:
                    cy, cx = stack.pop()
                    pts.append((cy, cx))
                    for ny, nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
                        if 0 <= ny < bbox.shape[0] and 0 <= nx < bbox.shape[1] and bbox[ny,nx] and not comp_seen[ny,nx]:
                            comp_seen[ny,nx] = True
                            stack.append((ny,nx))
                comp_area = len(pts)
                if comp_area < 0.05 * area:
                    continue
                ys_c = [p[0] for p in pts]
                xs_c = [p[1] for p in pts]
                min_y, max_y = min(ys_c), max(ys_c)
                min_x, max_x = min(xs_c), max(xs_c)
                height = max_y - min_y + 1
                width = max_x - min_x + 1
                aspect = width / height if height else 1
                perimeter = 0
                for cy, cx in pts:
                    if (cy == 0 or cy == bbox.shape[0]-1 or cx == 0 or cx == bbox.shape[1]-1 or
                        not bbox[cy-1, cx] or not bbox[cy+1, cx] or not bbox[cy, cx-1] or not bbox[cy, cx+1]):
                        perimeter += 1
                circularity = (4 * np.pi * comp_area / (perimeter * perimeter)) if perimeter else 0
                if circularity > 0.82 and 0.85 < aspect < 1.18 and comp_area > 0.10 * area:
                    ovals.append((comp_area, circularity, aspect))

    # Radial density smoothness: chaotic smoke should not have a near-monotonic smooth falloff.
    ys_all, xs_all = np.where(mask)
    if len(xs_all):
        cy, cx = ys_all.mean(), xs_all.mean()
        radii = np.sqrt((ys_all - cy) ** 2 + (xs_all - cx) ** 2)
        max_r = radii.max() if radii.size else 1
        bins = np.zeros(8)
        counts = np.zeros(8)
        for r, (y, x) in zip(radii, zip(ys_all, xs_all)):
            idx = min(7, int(r / max_r * 8))
            bins[idx] += 1
            counts[idx] += 1
        # normalize by ring area
        ring_density = []
        for i in range(8):
            r0 = i / 8 * max_r
            r1 = (i + 1) / 8 * max_r
            ring_area = np.pi * (r1*r1 - r0*r0)
            ring_density.append(bins[i] / ring_area if ring_area > 0 else 0)
        if len(ring_density) > 2:
            corr = np.corrcoef(range(len(ring_density)), ring_density)[0, 1]
        else:
            corr = 0
    else:
        corr = 0

    top_box = bbox[: max(1, bbox.shape[0] // 3), :]
    top_coverage = float(top_box.mean()) if top_box.size else 0.0

    return {
        "coverage": coverage,
        "top_coverage": top_coverage,
        "largest_gap": gap,
        "ovals": ovals,
        "radial_corr": float(corr),
    }

def main():
    times = [int(x) for x in sys.argv[1:]] if sys.argv[1:] else TIMES
    overall_ok = True
    for vt in times:
        normal_path = os.path.join(OUT, f"normal_{vt}.png")
        base_path = os.path.join(OUT, f"nosmoke_{vt}.png")
        capture(f"{BASE}", vt, normal_path)
        capture(f"{BASE}?nosmoke=1", vt, base_path)
        result = analyze(normal_path, base_path)
        if result is None:
            print(f"t={vt}: FAIL no smoke pixels detected")
            overall_ok = False
            continue
        oval_fail = len(result["ovals"]) > 0
        ok = (result["coverage"] >= 0.92 and result["top_coverage"] >= 0.90 and
              result["largest_gap"] <= 0.05 and not oval_fail and result["radial_corr"] > -0.98)
        overall_ok = overall_ok and ok
        print(f"t={vt}: {'PASS' if ok else 'FAIL'}")
        print(f"  coverage={result['coverage']:.3f} top={result['top_coverage']:.3f} "
              f"largest_gap={result['largest_gap']:.3f} radial_corr={result['radial_corr']:.3f}")
        if result["ovals"]:
            print(f"  ovals={result['ovals']}")
    if not overall_ok:
        sys.exit(1)

if __name__ == "__main__":
    main()
