import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('open call section is removed', () => {
  const html = read('index.html');
  const js = read('script.js');

  assert.doesNotMatch(html, /id="open-call"/);
  assert.doesNotMatch(html, /data-to="open-call"/);
  assert.doesNotMatch(html, /href="#open-call"/);
  assert.doesNotMatch(js, /id:\s*'open-call'/);
  assert.doesNotMatch(js, /open-call-video/);
});

test('issue 02 content lives inside the magazine section', () => {
  const html = read('index.html');

  assert.match(html, /<h3>Issue 01: <em style="color:#ff1493">Ecoslay, an Anthology<\/em><\/h3>/);
  assert.match(html, /<h3>Issue 02: <em style="color:#ff1493">The Urban Issue<\/em><\/h3>\n      <video src="images\/zoom_meeting_ecoslay_02\.mp4"[^>]*class="issue-02-video"/);
  assert.match(html, /With contributions by: Diana Andrei, Teresa Awa, Karla Jelic Balta, Max Koloman, Mary Maggic, Gaja Pegan Nahtigal, Philomena Natalia, Luiza Prado, Zakia Soomauroo, Katherine Tyndall/);
  assert.match(html, /Edited by the Ecoslay Mag team/);
  assert.match(html, /This project was generously funded by MA7 Stadt Wien Kultur\./);

  const magazineStart = html.indexOf('<section id="magazine"');
  const magazineEnd = html.indexOf('</section>', magazineStart);
  const issue02 = html.indexOf('Issue 02:');
  assert.ok(magazineStart > 0, 'magazine section should exist');
  assert.ok(issue02 > magazineStart && issue02 < magazineEnd, 'issue 02 should be inside magazine');
});

test('timeline keeps the existing formatting', () => {
  const html = read('index.html');

  assert.match(html, /<s>Open call launches: June 25th<\/s>/);
  assert.match(html, /<s>Open call closes: July 13<\/s>/);
  assert.match(html, /<s>Announcement of selected contributors<\/s>/);
  assert.match(html, /Work on contributions and edition: Sep 2026 - Spring 2027/);
  assert.match(html, /<strong style="color:#ff1493">Release of ECOSLAY #02: Spring 2027<\/strong>/);
});
