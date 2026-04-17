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

## Shareable Sermon Filters

On the Sermons page, filters update the URL using query parameters:

- series
- preacher
- topic
- book

Example:

- /sermons.html?series=House+of+Prayer&preacher=Pastor+Murunga

Opening that URL restores those filter selections automatically.
