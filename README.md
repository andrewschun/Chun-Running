# Chun Running

A blue-themed running workout tracker for Marcus, Dominic, and Ambrose.

## Features

- Coach Desk with team workout totals, per-athlete program progress, training records, and JSON backup export.
- Driveline Running: six weeks of exercise checklists with demo links from the supplied program.
- Separate OTA Body Weight, Beginner, and Advanced tabs.
- OTA Beginner and Advanced: each has 48 sessions across 12 weeks, with a checkbox per drill and demo hyperlinks transcribed from the PDFs.
- OTA Advanced unlocks separately for each athlete after every Beginner drill in all 48 sessions is checked. Unchecking a Beginner drill locks Advanced again.

## Run locally

Serve this directory using any static HTTP server, for example `python3 -m http.server 8000`, then open http://localhost:8000. No installation or build step is required.

## Storage and access

Workout logs and completion progress use browser localStorage. They do not sync across devices. Export a JSON backup before clearing browser data. The Advanced prerequisite is a browser-based workflow rule, not a server-enforced security boundary.

## Program coverage

Full OTA Beginner and Advanced Phases 1–3 are included. OTA Body Weight currently contains a selected reference drill. Demo availability depends on the provider; some OTA links may require access. Equipment links in the PDFs are labeled separately. Legacy Beginner session completion migrates to drill completion once for each athlete.

## Hosting

The root index.html and assets can be served by any static host. No Sites credentials or hosting identity are included in this repository.
