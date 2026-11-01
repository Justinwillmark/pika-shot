# PikaShot: setup and upkeep

## Publishing
- Quick way (as before): publish the project folder as it is.
- Faster, harder-to-copy way: `npm install` once, then `npm run deploy`. It shrinks and scrambles the scripts into `dist/` and publishes that.
- Every release: change `CACHE_NAME` in `serviceworker.js` (v39 -> v40 ...) so phones fetch the new files.

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

## The app icon
- A white scanner frame around a barcode on PikaShot teal (`#008C95`, the same teal as `background_color` in `manifest.json`). Because the colours match, the start-up screen Android draws on installed phones shows only the white mark on teal. That screen is made by Android from the manifest (name, `background_color`, icon): it cannot be switched off, only changed here.
- `icons/icon-192.png` and `icon-512.png` are the normal icon (rounded corners); `icon-maskable-512.png` is the full-square version that phones which cut icons into circles or squircles use. The same `icon-192.png` is the picture shown for a product that has no photo.
- An already installed app updates its icon on its own after Chrome next checks the manifest (it can take a day or more). Uninstalling and installing again shows it at once.

## Product pictures
The full photo lives on the phone. A small thumbnail (a few KB) is saved with the product in Firestore, so after logging out,
clearing browsing data or switching phones the picture comes back from the thumbnail. No Storage bucket is used.

### Snap Image (`capturePhoto` in `camera.js`)
- The screen says "Opening camera..." while the camera starts, then "Snapping Image" with a 2, 1 count. The time to settle focus and brightness (`PHOTO_SETTLE_MS`, 2 seconds) counts from the moment pictures are really coming in, not from the tap, so a slow phone is no longer made to wait for its own start-up plus a full countdown on top.
- The light comes on for photos (unless the person switched it off). The shot waits a moment after it comes on (`PHOTO_LIGHT_SETTLE_MS`) so the picture is not blown out, but never waits for a light a phone does not have.
- A camera that freezes right after starting is opened once more instead of being photographed frozen. A picture that comes out empty now says so ("The picture did not come out") instead of silently doing nothing.
- Leaving the camera screen in any way (Cancel, the arrow, the phone's Back) turns the camera off at once (`showView`). Before, Back and the arrow left it running, which kept it busy for the next scan or photo and could pop up a picture after the person had left.
- Pictures are never bigger than `PHOTO_MAX_SIDE` (1280 px) on the long side.

## Things are recorded once
- A sale gets its id when the confirm box opens, and the sale plus the stock it takes out are saved together on the phone (`DB.recordSale`). A second tap, a retry or a slow connection is the same sale: if that id is already saved, nothing changes. Editing a sale moves the stock by the difference only (`DB.editSale`).
- Nothing that needs the internet (the copy of a credit sale sent to the customer, telling a supplier the stock left) holds the screen or runs before the sale is safe. The credit copy has the id `xfer_<sale id>`, so it can only exist once.
- New products keep one id for as long as the form is open. A transfer being sent keeps one id (`xfer_<key>`) for as long as its box is open and is never written over once it exists.
- Accepting a transfer adds the items once: the phone notes it (`applied:<id>`) and the transfer in the cloud gets `appliedAt`. If an earlier try claimed it but stopped before adding the items, trying again finishes the job.
- Buttons that save go through `_once(name, job, button)` in `app.js`: while one is running a second tap does nothing and the button is off.

## Profile messages (`nudges.js`)
- The one message in the Profile card comes from `nudges.js`. All the words, and when each one applies, are in the `CATALOG` list at the top of that file.
- Three kinds take turns, never the same kind twice in a row: free airtime, business insights, motivation (light Pidgin is only used in motivation).
- It changes after every 5 actions (sales, scans, transfers, receipts shared or printed, in any mix). Each person gets their own shuffled order.
- Keep each message to 8 words or fewer with one emoji, in plain words.
- When a new message arrives by itself (the 5th action, a welcome, or a nudge on app open) the menu (hamburger) button gets a warm dot and its three lines ripple for 30 seconds.
  The dot stays until the Profile is opened.
- A soft double beep goes with it, in two strengths (`_playNudgeChime` in `app.js`; the numbers are in one place if you want them louder or quieter):
  - **Important** messages beep clearly: money owed, stock running out or customers short, "Need money for stock", a win (a record day, a customer paying back) and the welcome
    (`chime: true` in `CATALOG`, about 1 message in 5). At most 4 a day, at least 15 minutes after the last important one.
  - **All the other** messages (tips, encouragement) beep about 5 times softer (14 dB down). At most 6 a day, at least 10 minutes after the last beep of any kind, so a quiet one never follows an important one closely.
  - An important beep is never held back by quiet ones. Both wait until the person is out of the scanner (so they never sit on top of scan beeps; if both kinds are waiting, the important one plays),
    and neither plays, nor is counted, if the phone has not been touched since the app opened (browsers do not allow sound before a tap).
- These change straight away instead of waiting for 5 actions: a kind nudge when the app opens after a day or more without a sale, the welcome after a first sale,
  and a credit reminder (below) when the app opens.

**Things people can act on** (they go first, but never two insights in a row, and not while someone is serving customers: 4 or more sales in the last half hour)
- A customer owes on credit: after 3 days unpaid, "{name} owes {amount} since {day}", then again every 3 days until "Fully repaid?" is pressed (each customer has their own 3 days, the biggest debt first, never late at night).
  A tap opens Customers at that credit card. When the app opens and a reminder is due, it is said then (once a day).
- "You're running low on {product}" (best seller first, each product at most every 2 days), and "{product} is out of stock. Restock soon" (only for products that sold in the last 30 days). A tap opens My Products on the Low stock or Out of stock tab, at that product.
- Wholesalers and their salespeople: "{customer} is low on / out of {product}" (nothing left first, each customer at most every 3 days), and "{n} customers need stock" when 3 or more are low. A tap opens Customers at that customer.
  "Low" means under 10 units, the same line where the customer card turns red.
- "Need money for stock? Get help" is shown (at most once every 3 days) to anyone with more than 4 products low or out of stock, and to a top seller whose sales fell: 3 of the 7 days before had 100+ sales, yesterday and the day before were each under 50, and more than 2 products have been low or out of stock for more than 2 days. Tapping it opens Pika's WhatsApp line (`WA_NUMBER` in `app.js`) with the words "I'm a PikaShot top seller and need money for stock."

**How the rest is chosen** (weights in `CATALOG` and `kindWeight` in `nudges.js`)
- New accounts (first week, or under 15 sales) hear more about how to earn; a slow day or a long break gets more encouragement; a fresh win (a record day, a customer paying back, 15+ sales) gets celebrated first.
- Closer to a goal counts for more (5 sales from 100, "tomorrow makes 7 days in a row"); a streak about to break says so; evenings give the day's summary; Mondays and the start of a month give a fresh-start message.
- The more often a message has been shown the less often it comes up, and the last 8 are not repeated straight away.
- "Request product transfer when you restock" is for wholesalers and retailers (not salespeople) and comes up more when stock is low.
- Customers' stock for these messages is kept on the phone (`pika_custstock_<business phone>`), refreshed whenever the Customers tab is open and, in the background, at most every 12 hours when the app opens (one read of that business's customer list, only for wholesalers and their salespeople). Anything older than 3 days is ignored.

## Sounds (all made in `app.js`, no sound files)
- Good scan: one short, soft blip (`_playScanBeep`): a pure E6 with a faint octave below for warmth and above for sparkle, starting gently and fading smoothly. It replaced a sharp 2300 Hz square-wave beep.
- Transfer accepted: a rising four-note chime (`_playTransferChime`).
- New profile message: the double beep described above (`_playNudgeChime`).
- To change how a sound feels, edit the notes in its function: `freq` (pitch), `vol` (loudness), `attack` (how gently it starts) and `release` (how long it fades).

## Offline banner
- When the phone has no internet, a banner over the top of the page shows (on Home, My Products, Customers & Salespeople and All Sales; not in the scanner) "You're offline. Reconnect to use PikaShot and see new records". When it comes back it says "You're back online" for 2 seconds, then goes. It follows the phone's own online/offline signal, so a Wi-Fi connection with no data behind it still counts as online.
- The banner only floats over the page: it takes no room, so nothing moves or grows when it appears or goes. The teal part of Home scrolls away with the page; the banner stays pinned at the top while the page scrolls under it. It lives once, above all the pages (`#offline-banner` in `index.html`), and `_syncBanner` in `app.js` lists the pages that carry it.
- On Customers & Salespeople the old yellow "connect to the internet" notice is now invisible and only keeps its room, so the Customers / Salespeople tabs do not sit under the banner.
- "Customers" / "Salespeople" on the home page is a slim half capsule on the right, its flat end against the edge of the screen (`.stock-link-btn` in `style.css`). It names one thing at a time and every 8 seconds (only while the home page is on screen) the word rolls over to the other; both words sit in the same spot, so the capsule never changes size. Tapping it opens the page on the tab the word names. A salesperson only ever sees "Customers". The timing is in `_setStockLink` (`app.js`), the roll in `stock-word-in` / `stock-word-out` (`style.css`).

## The Profile
- Activity card (today's scans out of 100+, and the one message), then an "Account" row that is folded away every time the Profile opens. Opening it shows Name, Business, Location, Phone, Type and Logout. Cancel and Get help sit lower while it is folded.

## The phone's Back button
- A modal has a step of its own in the browser's history, so Back closes it (by pressing its own Close / Cancel button, so anything waiting on it, such as a PIN prompt, is let go) instead of leaving the page. A message or question pop-up closes on Back too, and nothing behind it moves.
- Back with nothing open goes to the page before, as it always did. A modal that can not be closed (a salesperson waiting to be confirmed) lets Back go on past it.
- When adding a modal: give its Close / Cancel button a `data-back` attribute (in `index.html`), and open and close it with `showModal` / `hideModal`. In code, use `this._back()` instead of `history.back()`.
- Every Cancel and Close button has the class `btn-cancel` (a red line and red text, like Logout; over the camera it keeps a white fill so it can be read). Add `btn-cancel` to the next one too. Other buttons (Decline, Done, OK, Try Again) keep their own look.

## Salespeople and customers
- A salesperson's Customers tab now also lists the customers' stock cards of their business (read only: no "Remove from list"), as well as the credit they recorded. It reads the customer list once and reuses it for 10 minutes (Refresh reads it again). Firestore rules already allowed this.

## Transfer to a customer
- The box is titled "Customer phone number". Beside it is a small add-customer button that opens the phone's contacts. It only shows in browsers that have the contact picker (Chrome on Android); elsewhere it stays hidden and the number is typed. A chosen contact's first Nigerian mobile number is used (any way it is written: +234 803..., 0803..., 803...), and goes through the same check as a typed number.
- A customer who is not on PikaShot gets the pop-up "Customer phone number is not on PikaShot. Please invite them on WhatsApp." The "WhatsApp invite" button opens WhatsApp on that customer's number with the message in `INVITE_TEXT` (`app.js`) already written. Nothing is sent by PikaShot itself: the person taps Send in WhatsApp.

## Select a Product
- When choosing a product to sell, My Products shows no product count, no inventory worth and no low-stock settings gear, only the search, the three tabs and the cards. All of that is CSS under `.selection-mode` in `style.css`.
- Each card has a teal line that keeps moving around its edge (a bright arc, 3.2 seconds a lap; people whose phone is set to reduce motion get a plain teal line). It is a spinning layer behind the card, so it stays light with many cards. Change the speed in `card-line-spin`.

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
