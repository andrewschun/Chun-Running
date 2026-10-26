# Chun Running

A blue-themed running workout tracker for Marcus, Dominic, and Ambrose.

## Features

- Individual athlete workout journals and JSON backup export.
- Driveline Running: six weeks of exercise checklists with demo links from the supplied program.
- Separate OTA Body Weight, Beginner, and Advanced tabs.
- OTA Beginner: 48 sessions across 12 weeks, with expandable exercise details.
- OTA Advanced unlocks separately for each athlete after all 48 Beginner sessions are checked. Unchecking a session locks Advanced again.

## Run locally

Serve this directory using any static HTTP server, for example `python3 -m http.server 8000`, then open http://localhost:8000. No installation or build step is required.

## Storage and access

Workout logs and completion progress use browser localStorage. They do not sync across devices. Export a JSON backup before clearing browser data. The Advanced prerequisite is a browser-based workflow rule, not a server-enforced security boundary.

## Program coverage

The full OTA Beginner session text is included. OTA Body Weight and Advanced currently contain selected reference drills; their full programs have not been imported. Vimeo demo availability depends on the provider.

## Hosting

The root index.html and assets can be served by any static host. No Sites credentials or hosting identity are included in this repository.
