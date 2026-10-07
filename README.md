# github-contrib-globe-badge

GitHub tells me how much I contributed. I wanted to know where.

[![My contributions badge](https://raw.githubusercontent.com/turbolego/github-contrib-globe-badge/main/badge.gif)](https://turbolego.github.io/github-contrib-globe-badge/)

A daily-updating GitHub contribution analytics badge showing where the owners of repositories you contribute to are located. Click the badge to open an **interactive Cobe globe** on GitHub Pages.

> **Important:** This doesn't tell you where you were when you wrote the code. It maps your contributions to the public location of the repository owners.

The visual is fun, but the engineering is the interesting part.

Your fork
  ↓
Another repository
  ↓
Original repository
  ↓
Repository owner
  ↓
Owner's public location
  ↓
Country on the globe

## What does the globe show?

Repository owner location ≠ contributor location.

The globe shows where the owners of the repositories you contributed to are located, not where you were sitting. Contributions in the same country share one marker with summed counts and links to all contributing repositories. Markers outside a recognized country are shown separately without a flag.

The animated GIF badge shows a rotating dotted world map with country markers, flags, commit and PR counts, and each country's percentage of tracked contributions. The globe completes one seamless rotation per loop. Clicking the badge opens the interactive version where the globe can be dragged and zoomed.

## Try it yourself

Fork → configure → GitHub Pages → README badge

1. Fork this repository
2. Replace `turbolego` with your GitHub username in `.github/workflows/badge-update.yml` or set `GITHUB_ACTOR` in Actions secrets
3. Enable GitHub Pages → Source: Deploy from branch → `main` / `(root)`
4. Add to your profile README:

```markdown
[![My contributions badge](https://raw.githubusercontent.com/turbolego/github-contrib-globe-badge/main/badge.gif)](https://turbolego.github.io/github-contrib-globe-badge/)
```

Replace `turbolego` with your username. GitHub Actions regenerates the badge daily.

Interactive demo: https://turbolego.github.io/github-contrib-globe-badge/

## How it works

```
GitHub commits authored by me
         │
         ├── Co-authored-by trailers
         │
         ▼
Resolve true repository origin
         │
         ├── GitHub fork source → follow to ultimate origin
         │
         └── Commits-search fallback → oldest repo sharing the SHA
         │
         ▼
Repository owner (not the fork owner)
         │
         ▼
GitHub profile location (free-text)
         │
         ▼
Nominatim geocoding
         │
         ├── Country polygon lookup
         └── Reverse geocode fallback
         │
         ▼
Country code + flag
         │
         ▼
┌──────────────┬──────────────┐
│ badge.gif    │ data.json    │
│ animated GIF │ Cobe globe   │
└──────┬───────┴──────┬───────┘
       ▼              ▼
  GitHub README   GitHub Pages
```

The entire thing runs on GitHub. No server, no database, no backend API.

1. GitHub Actions searches commits authored by the configured user since account creation (fallback 2023-01-01), plus commits crediting the user through a `Co-authored-by:` trailer matched by GitHub noreply address, public email, or login name.
2. For each commit, the generator resolves the true origin repository:
   - Follow GitHub's fork `source` field to the ultimate origin
   - Fall back to commits-search: find all public repos containing the commit SHA and pick the oldest by creation date (catches duplicated histories that aren't registered GitHub forks)
   - Origins are cached per repository with a 30-day TTL in `commit-cache.json` so resolution runs once per distinct repo, not once per commit
3. Commits are grouped by origin repository owner. Each owner's public GitHub profile location is geocoded with OpenStreetMap Nominatim. Country codes are determined from Natural Earth country polygons, falling back to Nominatim reverse geocoding for coastal locations.
4. Geocoded owners are grouped by country. `badge.gif` and `data.json` are written.
5. GitHub Pages serves `index.html` which loads Cobe and renders the interactive globe from `data.json`.

## The surprisingly hard part

### Finding the original repository

A commit lives in the fork you edited, not necessarily the project you meant to support.

### When GitHub doesn't know it's a fork

Many repos are seeded from a full clone of another repo's history without going through GitHub's fork feature. Fallback search is `sha:<SHA> is:public`, collect candidates, fetch creation dates, pick oldest.

### Caching the result

`commit-cache.json` stores `origin` and `resolvedAt` per SHA. TTL is 30 days because a repo that was private can turn public later and turn out to be the true older origin.

## What counts as a contribution?

Authored commits + Co-authored-by

- Authored: `author:<user> is:public -user:<user>`
- Co-authored: full-text search for `"Co-authored-by: <user>"`, verified by parsing commit message trailers

## Turning "Oslo, Norway" into 🇳🇴

GitHub profile locations are free text: `Oslo, Norway`, `Berlin`, `California`, `Internet`, `Earth`, `Remote`.

1. Nominatim forward geocode → lat/lon
2. Point-in-polygon test against country polygons
3. Reverse geocode fallback with Nominatim zoom=3
4. Flags from MIT-licensed `flag-icons`

## Why GitHub Actions?

| Normally you'd need | This project |
|---------------------|--------------|
| Database for caching | `commit-cache.json` committed to repo |
| Server for geocoding | Nominatim calls from the Action |
| Backend API | GitHub Actions computes everything |
| Cron | Scheduled workflow at 00:00 UTC |
| Hosting | GitHub Pages serves `index.html` + `data.json` |
| SSL/Domain | Free on `username.github.io` |

The Action runs daily, commits `badge.gif` + `data.json` + `commit-cache.json`, Pages picks up the new data automatically.

## Current data

Current generation: 165 commits, 28 merged PRs across 8 countries.

Example current distribution:
- 🇳🇴 Norway: 119 commits, 4 PRs, 63.7%
- 🇧🇷 Brazil: 9 commits, 9 PRs, 9.3%
- 🇺🇸 USA: 3 commits, 3 PRs, 3.1%
- 🇵🇹 Portugal: 2 commits, 7 PRs, 4.7%
- 🇯🇴 Jordan, 🇲🇪 Montenegro, 🇮🇳 India, 🇨🇳 China: 1 each

## Limitations

- GitHub locations are self-entered free text
- Not every owner has a location; orgs/bots may be missing
- Repository owner ≠ all contributors; visualises owner geography
- Country attribution is approximate for vague locations
- History bounded to account creation / 2023-01-01 fallback
- Percentages are of tracked/resolvable contributions, not all GitHub activity

## Repository layout

```
.
├─ index.html                         # interactive Cobe globe
├─ data.json                          # generated contribution data
├─ badge.gif                          # generated animated badge
├─ badge/generate-badge.js            # generator
├─ badge/group-markers.js
└─ .github/workflows/badge-update.yml # daily workflow
```

## Development

```bash
npm install
GITHUB_ACTOR=turbolego node badge/generate-badge.js
```

Writes `badge.gif` and `data.json`. Use `--render-only` to render from existing `data.json` without querying GitHub.

## Credits

Globe rendering powered by [Cobe](https://github.com/shuding/cobe) by Shu Ding. Flags from [flag-icons](https://github.com/lipis/flag-icons) (MIT).

## License

MIT

*Read the story: [GitHub tells me how much I contributed. I wanted to know where.](https://dev.to/turbolego/i-made-a-github-profile-badge-to-show-where-on-earth-you-have-contributed-to-public-repositories-43g5)*
