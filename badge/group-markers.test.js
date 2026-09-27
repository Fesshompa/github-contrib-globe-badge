import assert from 'node:assert/strict';
import test from 'node:test';
import { groupMarkersByCountry } from './group-markers.js';

test('groups same-country contributions and preserves all owners and unique repository links', () => {
  const markers = [
    { owner: 'a', countryCode: 'NO', location: [61, 8], commits: 3, pullRequests: 1, repositories: [{ name: 'one', url: 'https://github.com/a/one' }] },
    { owner: 'b', countryCode: 'US', location: [40, -74], commits: 2, pullRequests: 0, repositories: [] },
    { owner: 'c', countryCode: 'NO', location: [70, 19], commits: 4, pullRequests: 2, repositories: [{ name: 'one', url: 'https://github.com/a/one' }, { name: 'two', url: 'https://github.com/c/two' }] },
  ];
  const grouped = groupMarkersByCountry(markers);
  assert.equal(grouped.length, 2);
  assert.deepEqual(grouped[0], {
    countryCode: 'NO', location: [61, 8], commits: 7, pullRequests: 3,
    owners: ['a', 'c'], repositories: [markers[0].repositories[0], markers[2].repositories[1]],
  });
  assert.equal(grouped[1].countryCode, 'US');
  assert.deepEqual(groupMarkersByCountry(grouped), grouped);
});

test('keeps unrelated unlocated countries as separate markers', () => {
  const markers = [
    { owner: 'a', countryCode: null, location: [0, 0], commits: 1, pullRequests: 0 },
    { owner: 'b', countryCode: null, location: [1, 1], commits: 2, pullRequests: 0 },
  ];
  assert.deepEqual(groupMarkersByCountry(markers).map((marker) => marker.owners), [['a'], ['b']]);
});
