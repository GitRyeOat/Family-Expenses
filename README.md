# Split3

A tiny offline-first web app for three siblings to track who spent what on a shared Google Sheet.

- Tap a name, type an amount, optional memo, Save.
- Works offline; entries queue on the phone and sync to the sheet when a connection returns.
- Installable to the home screen (PWA). No accounts, no server — the backend is a free Google Apps Script attached to the shared sheet.

## Setup (once)

1. Create a Google Sheet and share it with all three siblings.
2. In the sheet: **Extensions → Apps Script**, delete the default code, paste in `apps-script/Code.gs`, and save.
3. **Deploy → New deployment → Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy, authorize, and copy the `/exec` URL.
4. Put that URL (and the three names) either into the `DEFAULT_*` constants at the top of `index.html`, or into the in-app ⚙︎ Settings on each phone.
5. Host this folder on GitHub Pages. Open the page on each phone → Share → **Add to Home Screen**.

## Notes

- Sync is idempotent: each entry has a unique ID and the script skips duplicates, so offline retries never double-log.
- "Anyone" access on the script means anyone with the URL can append rows — keep the URL within the family. The sheet itself stays private to whoever it's shared with.
