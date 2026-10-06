export function groupMarkersByCountry(markers) {
  const grouped = new Map();
  for (const marker of markers) {
    // Keep US markers separate per location/state instead of merging whole country
    const isUS = marker.countryCode === 'US';
    const key = isUS ? Symbol() : (marker.countryCode || Symbol());
    let group = grouped.get(key);
    if (!group) {
      group = {
        countryCode: marker.countryCode || null,
        location: marker.location,
        commits: 0,
        pullRequests: 0,
        owners: [],
        repositories: [],
      };
      grouped.set(key, group);
    }
    group.commits += marker.commits;
    group.pullRequests += marker.pullRequests;
    for (const owner of marker.owners || [marker.owner]) {
      if (!group.owners.includes(owner)) group.owners.push(owner);
    }
    for (const repo of marker.repositories || []) {
      if (!group.repositories.some((existing) => existing.url === repo.url)) {
        group.repositories.push(repo);
      }
    }
  }
  return [...grouped.values()];
}
