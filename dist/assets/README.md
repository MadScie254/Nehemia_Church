# Nehemia Worship Center — Image Upload Guide

Upload files to this `assets` folder using the exact names below.
After upload, they will automatically show across the website.

## Important Fix (Bishop Photo)

The site expects:

- `bishop-david-walukhu.jpg`

If your file is named `bishop-david-walukhu.jpg.jpeg`, rename it to `bishop-david-walukhu.jpg`.

## Core Portrait and Brand Files

These are directly used by the pages and SEO metadata.

- `bishop-david-walukhu.jpg`
- `pastor-murunga.jpg`
- `selina-walukhu.jpg`
- `walukhu-family.jpg`
- `pastor-placeholder.svg`
- `logo.png`
- `og-image.jpg`

## Full Background Image Upload List (All Pages)

Every Unsplash background in the website can now be overridden by local files.
Upload any of these names and your image will replace that section automatically.

- `photo-1420585269105-d908ec316eb3.jpg`
- `photo-1425136738262-212551713a58.jpg`
- `photo-1438032005730-c779502df39b.jpg`
- `photo-1438232992991-995b7058bbb3.jpg`
- `photo-1447069387593-a5de0862481e.jpg`
- `photo-1464366400600-7168b8af9bc3.jpg`
- `photo-1476234251651-f353703a034d.jpg`
- `photo-1478145046317-39f10e56b5e9.jpg`
- `photo-1481627834876-b7833e8f5570.jpg`
- `photo-1488521787991-ed7bbaae773c.jpg`
- `photo-1490730141103-6cac27aaab94.jpg`
- `photo-1490750967868-88aa4486c946.jpg`
- `photo-1491438590914-bc09fcaaf77a.jpg`
- `photo-1504052434569-70ad5836ab65.jpg`
- `photo-1507692049790-de58290a4334.jpg`
- `photo-1509099863731-ef4bff19e808.jpg`
- `photo-1511379938547-c1f69419868d.jpg`
- `photo-1511578314322-379afb476865.jpg`
- `photo-1511632765486-a01980e01a18.jpg`
- `photo-1515168833906-d2a3b82b302a.jpg`
- `photo-1515169067868-5387ec356754.jpg`
- `photo-1516026672322-bc52d61a55d5.jpg`
- `photo-1517256064527-09c73fc73e38.jpg`
- `photo-1519491050282-cf00c82424b4.jpg`
- `photo-1519791883288-dc8bd696e667.jpg`
- `photo-1519834785169-98be25ec3f84.jpg`
- `photo-1521572267360-ee0c2909d518.jpg`
- `photo-1521737604893-d14cc237f11d.jpg`
- `photo-1521791136064-7986c2920216.jpg`
- `photo-1524178232363-1fb2b075b655.jpg`
- `photo-1524504388940-b1c1722653e1.jpg`
- `photo-1526374965328-7f61d4dc18c5.jpg`
- `photo-1527529482837-4698179dc6ce.jpg`
- `photo-1529070538774-1843cb3265df.jpg`
- `photo-1544005313-94ddf0286df2.jpg`
- `photo-1566753323558-f4e0952af115.jpg`
- `photo-1583394293214-28ded15ee548.jpg`

## How It Works Automatically

- For direct files (`bishop-david-walukhu.jpg`, etc.), pages reference them directly.
- For Unsplash placeholders, `script.js` now checks local files first using this pattern:
	- `assets/photo-<unsplash-id>.jpg`
- If a local file exists, your upload shows.
- If not, the current Unsplash placeholder still appears.

No HTML edits are needed after upload.
