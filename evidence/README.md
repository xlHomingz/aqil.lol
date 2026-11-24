# Evidence Catalog

This folder lists the evidence. It holds **no raw files**. The originals are kept offline and are never committed. The SHA-256 hash of each original lets me prove later that a file is unchanged.

## Handling rules

- Public images are in `assets/screenshots/`. They are copies, not the originals.
- **Only the personal data of real people is covered.** Names, phone numbers and emails are covered with solid black boxes. Nothing was edited, redrawn or invented.
- **Full web addresses are visible** in every image that shows an address bar.
- Browser tab strips were cropped, because they showed unrelated tabs. **The bottom bar with the clock and date is kept in full** wherever the original had one.
- Images 04, 06, 07, 08, 10, 11, 14 and 15 have a dark strip under the screenshot with its date and time (UTC+4), taken from the original file name.
- Field names, cities, program names, timestamps and company mailboxes were left visible.

## Screenshots

| ID | Original file | Time (UTC+4) | Public copy | Treatment | SHA-256 of original |
|---|---|---|---|---|---|
| E-01 | Screenshot 2026-11-19 224751.png | 19 Nov 2026, 22:47:50 (clock) | [01-chat-widget-parameter-check.png](../assets/screenshots/01-chat-widget-parameter-check.png) | Tabs cropped; full bottom bar kept | `3091f6cd7c473236...` |
| E-02 | Screenshot 2026-11-19 225158.png | 19 Nov 2026, 22:51:58 (clock) | [12-chat-widget-country-parameter-check.png](../assets/screenshots/12-chat-widget-country-parameter-check.png) | Tab strip cropped | `3311f1fa335e44c5...` |
| E-03 | Screenshot 2026-11-19 225321.png | 19 Nov 2026, 22:53:20 (clock) | [02-chat-widget-upstream-error.png](../assets/screenshots/02-chat-widget-upstream-error.png) | Tabs cropped; full bottom bar kept | `8d4add7a9a038837...` |
| E-04 | Screenshot 2026-11-19 230209.png | 19 Nov 2026, 23:02:08 (clock) | [03-wordpress-login-robots-tab.png](../assets/screenshots/03-wordpress-login-robots-tab.png) | All tab titles masked except robots.txt and active tab | `f59cfa66faab7fe7...` |
| E-05 | Screenshot 2026-11-19 230918.png | 19 Nov 2026, 23:09:18 (file name) | [04-sensitive-file-check-denied.png](../assets/screenshots/04-sensitive-file-check-denied.png) | Tab strip cropped | `8dd4e8995002d9db...` |
| E-06 | Screenshot 2026-11-19 232101.png | 19 Nov 2026, 23:21:00 (clock) | [05-form-submissions-endpoint-redacted.png](../assets/screenshots/05-form-submissions-endpoint-redacted.png) | Names, phones, emails covered; tabs cropped | `4c865574fab74fb9...` |
| E-07 | Screenshot 2026-11-19 233551.png | 19 Nov 2026, 23:35:50 (clock) | [13-api-description-first-view.png](../assets/screenshots/13-api-description-first-view.png) | Tab strip cropped | `42e6ff33fdf0baab...` |
| E-08 | Screenshot 2026-11-20 032835.png | 20 Nov 2026, 03:28:35 (file name) | [06-report-attachment-redacted.png](../assets/screenshots/06-report-attachment-redacted.png) | Names, phones, emails covered | `cf7b872e95bdfa6d...` |
| E-09 | Screenshot 2026-11-22 201520.png | 22 Nov 2026, 20:15:20 (file name) | [07-after-report-access-denied.png](../assets/screenshots/07-after-report-access-denied.png) | Optimised only | `b379ff4305f90247...` |
| E-10 | Screenshot 2026-11-22 201526.png | 22 Nov 2026, 20:15:26 (file name) | [14-gmail-attachment-preview-redacted.png](../assets/screenshots/14-gmail-attachment-preview-redacted.png) | Names, phones, emails covered | `250f43184f411f34...` |
| E-11 | Screenshot 2026-11-22 201824.png | 22 Nov 2026, 20:18:24 (file name) | [08-after-report-access-denied-raw.png](../assets/screenshots/08-after-report-access-denied-raw.png) | Optimised only | `beeaa791e651ea36...` |
| E-12 | Screenshot 2026-11-22 202440.png | 22 Nov 2026, 20:24:39 (clock) | [09-api-spec-ai-config-fields.png](../assets/screenshots/09-api-spec-ai-config-fields.png) | Tabs cropped; full bottom bar kept | `eeeec087e3c4a148...` |
| E-13 | Screenshot 2026-11-22 212439.png | 22 Nov 2026, 21:24:39 (file name) | [15-greeting-response.png](../assets/screenshots/15-greeting-response.png) | Optimised only | `5aa8f2dce610b487...` |
| E-14 | Screenshot 2026-11-22 213101.png | 22 Nov 2026, 21:31:01 (file name) | [10-chat-assistant-restored.png](../assets/screenshots/10-chat-assistant-restored.png) | Optimised only | `5756c42c77256572...` |
| E-15 | Screenshot 2026-11-22 213411.png | 22 Nov 2026, 21:34:11 (file name) | [11-unauthenticated-lookup-result.png](../assets/screenshots/11-unauthenticated-lookup-result.png) | Optimised only | `95e1980d86537f24...` |

| E-16 | New screenshot (24 Nov 2026) | 24 Nov 2026, 04:01:32 (clock) | [18-api-description-now-not-found.png](../assets/screenshots/18-api-description-now-not-found.png) | Optimised only; full bottom bar kept | `2de77bf8bd7208c4...` |

## Other evidence

| Item | Where |
|---|---|
| Gmail export of the full email thread | [emails/email-thread.pdf](emails/email-thread.pdf), text in [emails/email-thread.md](emails/email-thread.md), picture [Image 17](../assets/screenshots/17-email-thread-gmail-export.png) |
| Capture at 22:51:35 (test text shown as plain characters) | [Image 16](../assets/screenshots/16-chat-widget-text-shown-plain.png). Taken from a copy I sent to my phone, so the file name time is a transfer time. |
| Seven other `WhatsApp Image ...` files | Full-screen copies of screenshots above. Not repeated here. The two that show personal data are not published uncovered. |
| Saved API description (33-page PDF) | Exported on 22 Nov 2026 at 22:48. Uploaded a second time on 24 Nov 2026 with identical content. Kept offline. I checked it for credentials and found none. |
| Working notes (HTML endpoint inventory) | Kept offline. Source for the claims marked *notes*. Weaker proof than screenshots. |

## Time sources

See [docs/timeline.md](../docs/timeline.md). File-name times are Windows screenshot names; clock times are read from the taskbar.
