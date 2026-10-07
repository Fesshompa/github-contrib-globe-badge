export function groupMarkersByCountry(markers) {
  // First group by countryCode + location to keep a single dot per unique GPS location
  const byLocation = new Map();
  for (const marker of markers) {
    const lat = marker.location?.[0];
    const lon = marker.location?.[1];
    const locKey = `${lat},${lon}`;
    const countryKey = marker.countryCode || '__unknown__';
    const key = `${countryKey}::${locKey}`;
    let group = byLocation.get(key);
    if (!group) {
      group = {
        countryCode: marker.countryCode || null,
        location: marker.location,
        commits: 0,
        pullRequests: 0,
        owners: [],
        repositories: [],
      };
      byLocation.set(key, group);
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
  return [...byLocation.values()];
}
