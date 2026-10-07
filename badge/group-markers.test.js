import assert from 'node:assert/strict';
import test from 'node:test';
import { groupMarkersByCountry } from './group-markers.js';

test('keeps one dot per unique GPS location and merges duplicate locations', () => {
  const markers = [
    { owner: 'a', countryCode: 'NO', location: [61, 8], commits: 3, pullRequests: 1, repositories: [{ name: 'one', url: 'https://github.com/a/one' }] },
    { owner: 'b', countryCode: 'US', location: [40, -74], commits: 2, pullRequests: 0, repositories: [] },
    { owner: 'c', countryCode: 'NO', location: [70, 19], commits: 4, pullRequests: 2, repositories: [{ name: 'one', url: 'https://github.com/a/one' }, { name: 'two', url: 'https://github.com/c/two' }] },
    { owner: 'd', countryCode: 'NO', location: [61, 8], commits: 2, pullRequests: 0, repositories: [] },
  ];
  const grouped = groupMarkersByCountry(markers);
  // Two distinct NO locations + US = 3 groups
  assert.equal(grouped.length, 3);
  const no61 = grouped.find(g => g.countryCode === 'NO' && g.location[0] === 61);
  assert.ok(no61);
  assert.equal(no61.commits, 5);
  assert.deepEqual(no61.owners.sort(), ['a','d']);
  assert.equal(grouped[1].countryCode, 'US');
  // Idempotent
  assert.deepEqual(groupMarkersByCountry(grouped), grouped);
});

test('keeps unrelated unlocated countries as separate markers', () => {
  const markers = [
    { owner: 'a', countryCode: null, location: [0, 0], commits: 1, pullRequests: 0 },
    { owner: 'b', countryCode: null, location: [1, 1], commits: 2, pullRequests: 0 },
  ];
  assert.deepEqual(groupMarkersByCountry(markers).map((marker) => marker.owners), [['a'], ['b']]);
});
