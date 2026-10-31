# PikaShot: setup and upkeep

## Publishing
- Quick way (as before): publish the project folder as it is.
- Faster, harder-to-copy way: `npm install` once, then `npm run deploy`. It shrinks and scrambles the scripts into `dist/` and publishes that.
- Every release: change `CACHE_NAME` in `serviceworker.js` (v26 -> v27 ...) so phones fetch the new files.

## Settings in one place (`config.js`)
| Setting | What it does |
| --- | --- |
| `maxProducts` | Products one account can hold (130) |
| `editsPerHour` | Hand edits of products per hour (5) |
| `maxDevices` | Phones one account can be logged in on (4). Must match the places `'1'..'4'` in `firestore.rules` |
| `appCheckKey` | reCAPTCHA v3 site key for App Check (empty until set up) |

## Firebase console, once
1. **Rules**: paste `firestore.rules` into Firestore Database > Rules > Publish.
2. **App Check** (stops copies of the app from using your database):
   Build > App Check > register the web app with reCAPTCHA v3 > paste the site key into `config.js` > publish.
   Set the token lifetime to 7 days (fewer reCAPTCHA checks). Watch the request graph for a few days, until nearly all
   requests show as verified, and only then press Enforce for Cloud Firestore (older cached copies of the app have no token).
3. **API key** (Google Cloud console > APIs & Services > Credentials > the browser key):
   Application restriction: websites, only your live address (`https://yourdomain/*`) and `https://pika-shot.firebaseapp.com/*`.
   API restriction: Identity Toolkit, Token Service, Cloud Firestore, Firebase App Check.
4. **Authentication > Settings > Authorized domains**: keep only your live address and the `firebaseapp.com` one.
   **Sign-in method**: only Anonymous (phones) and Email/Password (the dashboard sign-in).
5. **Index for salespeople** (optional, saves reads): Firestore > Indexes > Composite: collection `sales`,
   fields `recordedBy` ascending + `lastUpdate` ascending, scope Collection. Without it a salesperson's phone still works, it just re-reads their own sales.

## What is enforced where
| Rule | Enforced by |
| --- | --- |
| 4 phones per account | Firestore rules (only four place documents can exist) and the app |
| PIN and PIN reset | App (PIN is scrambled before it is saved) and rules (changes need the WhatsApp check) |
| 130 products, 5 edits per hour | The app only. Rules cannot count documents |
| Thumbnails under ~40 KB | App and rules |
| Who may list all users, read locations | Rules (dashboard sign-in only) |

## Free-plan quota (Spark: 50,000 reads and 20,000 writes a day)
- Phones only ask for what changed since last time (`lastUpdate`), and keep a copy of it on the phone, so a normal day is small.
- Where to watch: Firestore Database > Usage.
- A new phone (or cleared data) reads that account's products and sales in full once.

## Product pictures
The full photo lives on the phone. A small thumbnail (a few KB) is saved with the product in Firestore, so after logging out,
clearing browsing data or switching phones the picture comes back from the thumbnail. No Storage bucket is used.

## Profile messages (`nudges.js`)
- The one message in the Profile card comes from `nudges.js`. All the words, and when each one applies, are in the `CATALOG` list at the top of that file.
- Three kinds take turns, never the same kind twice in a row: free airtime, business insights, motivation (light Pidgin is only used in motivation).
- It changes after every 5 actions (sales, scans, transfers, receipts shared or printed, in any mix). Each person gets their own shuffled order.
- Two exceptions change it straight away: a kind nudge when the app opens after a day or more without a sale, and a welcome after the first sale.
- Keep each message to 8 words or fewer with one emoji.
- "Need money for stock? Get help" is shown (at most once every 3 days, and never right after another insight) to anyone with more than 4 products low or out of stock, and to a top seller whose sales fell: 3 of the 7 days before had 100+ sales, yesterday and the day before were each under 50, and more than 2 products have been low or out of stock for more than 2 days. Tapping it opens Pika's WhatsApp line (`WA_NUMBER` in `app.js`) with the words "I'm a PikaShot top seller and need money for stock."
- When a new message arrives by itself (the 5th action, a welcome, or the nudge on app open) the homepage capsule shakes for 30 seconds, or until the Profile is opened.

## Dashboard: reading GPS
- The Users tab and the users CSV turn each GPS point into the nearest Lagos area (the 20 areas people choose at sign-up), say whether it fits the place they chose,
  give the distance from the middle of the chosen area, a map link, the accuracy and the day it was saved. The raw latitude and longitude stay at the end of the CSV.
- It is worked out on the dashboard page from a built-in list in `admin.js` (`AREAS`); no coordinates are sent to any outside service.
- The location is the latest one saved: a person who logs in on another phone, or after logging out, saves a fresh one. Check "GPS saved on" against "Joined" to see if it is from sign-up.
- Phone location without GPS (cell towers and Wi-Fi) can be a few kilometres out: look at the accuracy column.

## Known limits (be honest with yourself about these)
- Identity is phone + PIN with an anonymous Firebase sign-in, so Firestore cannot tell two people apart. Anyone who can reach the
  database and knows a phone number can read that account's profile. The scrambled PIN slows guessing; it does not stop it.
  The real fix is server-side checks (Cloud Functions needs the paid Blaze plan) or Firebase phone sign-in (SMS costs).
- Anything a browser can run can be downloaded. Scrambling the code and App Check make copying slow and useless against your
  database, not impossible.
