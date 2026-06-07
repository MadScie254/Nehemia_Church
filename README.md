# Nehemia Ministry Kenya Website

This project now includes a shared backend for project donations and URL-shareable sermon filters.

## Run Locally

- Install dependencies with npm install.

- Start the server with npm start.

- Open [http://localhost:3000](http://localhost:3000).

## What Is Included

- Static site pages served by Express.
- Donation API with persistent storage in a backend data file.
- Project progress bars on the Give page now read from shared backend totals.
- Sermon filters now sync with the URL query string for shareable filtered views.

## Donation Backend

API routes:

- GET /api/projects
- POST /api/donations

Donation data store:

- Runtime file: backend/data/donations.json
- Seed example: backend/data/donations.example.json

## Cloudflare Pages Deployment

This repository now supports Cloudflare Pages static hosting with Pages Functions for donations.

Build settings:

- Build command: `npm run build`
- Build output directory: `dist`

Pages Functions API routes:

- `GET /api/health`
- `GET /api/projects`
- `POST /api/donations`

### Required KV Binding (for shared donation persistence)

Create a KV namespace in Cloudflare and bind it to your Pages project as:

- Variable name: `DONATIONS_KV`

Without this binding, donation endpoints return an error because persistent storage is unavailable.

### Local Notes

Local Express mode remains available with:

- `npm install`
- `npm start`

Cloudflare Pages Functions mode uses the `/functions` directory during Pages deployment.

## Shareable Sermon Filters

On the Sermons page, filters update the URL using query parameters:

- series
- preacher
- topic
- book

Example:

- /sermons.html?series=House+of+Prayer&preacher=Pastor+Murunga

Opening that URL restores those filter selections automatically.
