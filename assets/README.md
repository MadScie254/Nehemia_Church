# Nehemia Worship Center — Image Assets

This folder should contain all the real images used across the website.
Upload your photos using the **exact filenames** listed below, and they will
automatically replace the Unsplash placeholder images in the HTML.

---

## Leader Photos

| Filename | Used On | Description |
|---|---|---|
| `bishop-david-walukhu.jpg` | index, leadership | Portrait of Bishop David Walukhu |
| `pastor-murunga.jpg` | index, leadership | Portrait of Pastor Murunga |
| `walukhu-family.jpg` | leadership | Bishop David & Mama Selina Walukhu family photo |

| `pastor-placeholder.svg` | leadership, branches | Generic placeholder used when a pastor photo isn't yet available |
| `branch-pastor-<slug>.jpg` | branches | Optional: branch pastor portrait files (use a slug like `chebich-albert-murere`)

## Branding & SEO

| Filename | Used On | Description |
|---|---|---|
| `logo.png` | Schema/SEO | Church logo (used in schema.org metadata) |
| `og-image.jpg` | All pages (meta) | Open Graph / social sharing image (1200×630 recommended) |

## Recommended Image Specs

- **Leader Photos:** Min 1200×1600, portrait orientation, clear face framing
- **OG Image:** 1200×630, landscape, church name + tagline overlay
- **Logo:** PNG with transparent background, min 512×512

---

## How Placeholders Work

All images in the HTML currently use Unsplash URLs as external fallback backgrounds.
When you upload a local file with the matching filename above, the browser will
use your file first (via the CSS `background-image` multi-source syntax or `<img>` tags).

For `<img>` tags (like the family photo), the `onerror` handler will show a
fallback icon if the image file is missing.

---

## Pages in the Website

| Page | File | Status |
|---|---|---|
| Homepage | `index.html` | ✅ Updated |
| About Us | `about.html` | ✅ Updated |
| Leadership | `leadership.html` | ✅ Updated |
| Sermons & Media | `sermons.html` | ✅ Updated |
| Ministries | `ministries.html` | ✅ Updated |
| Events | `events.html` | ✅ Updated |
| Give / Toa | `give.html` | ✅ Updated |
| Prayer | `prayer.html` | ✅ Updated |
| Contact & Gallery | `contact.html` | ✅ Updated |
| Our Branch Network | `branches.html` | ✅ NEW |
| Bible Training College | `college.html` | ✅ NEW |
| New Promise Home | `newpromise.html` | ✅ NEW |
