# Findings

Eight observations, with the proof, how sure I am, and the status on **22 Nov 2026** (my last full check was at 22:48; F-02 was re-checked on 24 Nov 2026 at 04:01). I keep the severity modest. I describe what I saw, not what might happen in theory.

| ID | What I saw | How sure | Proof | Status on 22 Nov 2026 |
|---|---|---|---|---|
| F-01 | Public address returned form data with personal details | **Confirmed** | Images 05, 06 | **Closed** (Images 07, 08) |
| F-02 | Public API description (`openapi.json`) of the chat backend, with default AI instruction text | **Confirmed** | Images 09, 13, 18, saved copy | **Closed** ("Not Found" on 24 Nov 2026, 04:01) |
| F-03 | Chatbot showed a raw AI-provider quota error | **Confirmed** | Image 02 | Solved (Image 10) |
| F-04 | Read-only helper lookups worked with no login | **Confirmed** (one), **notes** (others) | Image 11, notes | Still working at 21:34:11 |
| F-05 | Admin and bot actions needed authorization | **Notes** | My notes | Good result, no issue |
| F-06 | Three write actions gave a form error before any login result | **Not sure** | My notes | Not tested, on purpose |
| F-07 | An admin page expects its token in the web address | **Possible concern** | API file and a note | Not tested |
| F-08 | An Excel/Word to Markdown converter page and endpoint exist, and the page has no login box | **Possible concern** | Notes, API file | Not tested |

## F-01: Personal data on a public address

**Address:** `https://workandtravel.com//wp-json/forms/v1/email-logs`
**What:** The address returned recent contact-form logs. Fields: full name, phone, email, city, chosen program, a branch mailbox, city-level location and timestamps.
**Why it matters:** Contact details linked to an interest in a program can be used for phishing or unwanted contact. Anyone who found the address could read them.
**What I do not know:** how many records there were, whether anyone else read them, or how long the address was open.
**Likely cause (a common pattern, not a claim about their code):** a data route without a permission check. The usual fix is to allow only logged-in administrators, which matches the 401 I saw later.
**Status:** Closed.

## F-02: Public API description

**What:** The OpenAPI description of the chat application was public. It has about 35 paths, field definitions, and two default texts: an AI instruction block and a message template.
**Why it matters:** It gives outsiders a map of the backend, and internal instructions are business information.
**What it is not:** a breach. I saw no keys, tokens or passwords in the text I reviewed.
**Status:** Open on 22 Nov 2026 at 22:48. **Closed** by 24 Nov 2026 at 04:01, when it answers `{"detail":"Not Found"}` ([Image 18](../assets/screenshots/18-api-description-now-not-found.png)). This happened after my follow-up email (22 Nov 2026, 20:16), and at most 29 hours 13 minutes after my last open check. I do not know the exact time, and I do not know if the follow-up caused it. A "Not Found" only tells me the description is no longer served. It does not tell me anything about the application behind it.

## F-03: Raw upstream error

**What:** The chatbot printed the AI provider's error: credits used up, with a billing link.
**Why it matters:** Small information leak and a poor experience for visitors. No secrets were shown.
**Status:** Solved when credits returned.

## F-04: Open read-only lookups

**What:** The block list API (add, delete, list, check) exists. Only the check is open. Helpers that answer "is this ID blocked?", "is this bot name taken?" and "what is this task's status?" needed no login. I have a screenshot for the first one (placeholder value, answer false). The others come from my notes.
**Why it matters (possible only):** helpers like these can be used to check if accounts exist. I did not try that.

## F-05: Protected admin actions

The admin endpoints exist, and they need a token. My notes say the actions for blocks, bot accounts and follow-up settings answered *unauthorized* (401), and the internal-channel actions answered *local only*. This is **good news**, and I list it so the case does not look worse than it was. I did not try to get around either check.

## F-06: Form error before login result

For three write actions, an empty request gave a form error and not a login error. So I could not tell if they were protected. Testing needed real data on a live system, so **I did not test**. It is an open question, not a vulnerability.

## F-07: Token in the address

The API file and one error message suggest an admin page takes its token in the web address. Secrets in addresses can leak through logs and browser history. This is a design concern. **I did not test it.**

## F-08: File converter

A page at `/pages/parser` and an endpoint `/api/v1/parser/convert` convert `.xlsx` and `.docx` files to Markdown. The page has no login box. The endpoint gave a form error before any login result, so I could not tell if it is protected. If it were open, outsiders could make the company's server process files. I **did not upload anything**, so this stays a possible concern. See [api-map.md](api-map.md).

## What I do not claim

- That the site was hacked or a database was breached.
- That I got admin access or ran any admin action.
- That every endpoint was vulnerable, or that a certain number of people were affected.
- That anything except F-01 and F-02 was fixed. I have not re-checked the others since 22 Nov 2026.

See also: [api-map.md](api-map.md) for every endpoint and [ai-assistant.md](ai-assistant.md) for the OpenAI story.
