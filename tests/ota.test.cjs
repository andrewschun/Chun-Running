const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const model = require('../ota-model.js');
const beginner = JSON.parse(fs.readFileSync('ota-beginner-data.json', 'utf8'));
const advanced = JSON.parse(fs.readFileSync('ota-advanced-data.json', 'utf8'));
test('both programs contain four sessions in each of twelve weeks and valid drill links', () => {
  for (const sessions of [beginner, advanced]) {
    assert.equal(sessions.length, 48);
    assert.equal(new Set(sessions.flatMap(s => s.drills.map(d => d.id))).size, sessions.flatMap(s => s.drills).length);
    for (let week = 1; week <= 12; week++) assert.deepEqual(sessions.filter(s => s.week === week).map(s => s.day), [1,2,3,4]);
    for (const session of sessions) for (const drill of session.drills) {
      if (drill.text !== 'Dynamic Warm Up') assert.ok(drill.links.some(link => link.kind === 'demo'), drill.text);
      for (const link of drill.links) assert.ok(['http:', 'https:'].includes(new URL(link.url).protocol));
    }
  }
});
test('Advanced requires every Beginner drill; a single unchecked drill relocks it', () => {
  const checks = Object.fromEntries(beginner.flatMap(s => s.drills.map(d => [d.id, true])));
  assert.equal(model.programComplete(beginner, {}), false);
  assert.equal(model.programComplete(beginner, checks), true);
  checks[beginner[47].drills.at(-1).id] = false;
  assert.equal(model.programComplete(beginner, checks), false);
  assert.equal(model.sessionComplete(beginner[47], checks), false);
  assert.equal(model.programComplete([], checks), false);
});
test('legacy completed sessions migrate only their own drills without mutating legacy records', () => {
  const legacy = { [beginner[0].id]: true, [beginner[1].id]: false };
  const checks = model.migrateSessions(beginner, legacy);
  assert.equal(model.sessionComplete(beginner[0], checks), true);
  assert.equal(model.sessionComplete(beginner[1], checks), false);
  assert.equal(Object.keys(checks).length, beginner[0].drills.length);
  assert.equal(Object.keys(legacy).length, 2);
});
test('equipment links do not replace demo links', () => {
  const band = beginner[0].drills.find(d => d.text.includes('Band Pull Aparts'));
  assert.ok(band.links.some(l => l.kind === 'demo' && l.url.includes('band-pull-aparts')));
  assert.ok(band.links.some(l => l.kind === 'equipment' && l.url.includes('trainingbands')));
});
