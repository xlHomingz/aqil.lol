# API Map

The public API description (`openapi.json`) lists **35 paths and 36 operations** for the chat helper application on `en.workandtravel.com/tz1`. This page groups them and shows what each one answered when I looked on 22 Nov 2026.

**How to read it.** The status words come from my working notes, not from screenshots, except where an image is named. I did **not** send real data to any write action. "Not tested" means I left it alone on purpose, because a test could have changed real data.

| Word | Meaning |
|---|---|
| **Open** | Answered with no login |
| **Token** | Answered 401: an admin token is required |
| **Local only** | Answered 403: only the company's own chat connectors may call it |
| **Unknown** | Gave a form error before any login result, so I could not tell |
| **Not tested** | Left alone on purpose |

Base address: `https://en.workandtravel.com/tz1`

**Update, 24 Nov 2026, 04:01:** the API description itself now answers "Not Found" ([Image 18](../assets/screenshots/18-api-description-now-not-found.png)). The tables below show what I saw on 22 Nov 2026 and have not been re-checked.

## AI helper ("generations")

| Method | Path | What I saw |
|---|---|---|
| GET | `/api/v1/generations/greeting` | **Open.** Returns the first chat message ([Image 15](../assets/screenshots/15-greeting-response.png)) |
| POST | `/api/v1/generations/add` | **Unknown.** Form error on an empty request. Takes user id, text and platform |
| GET | `/api/v1/generations/task/{task_id}` | **Open.** Said "Task not found" for a made-up id |
| GET | `/api/v1/generations/task_status/{task_id}` | **Open.** Same answer |
| POST | `/api/v1/generations/upload_assistant_files` | **Not tested.** The spec shows no form, so a test might have uploaded a file |

## Web pages

| Method | Path | What I saw |
|---|---|---|
| GET | `/pages/generation` | **Open.** The chat widget used on the main site ([Image 10](../assets/screenshots/10-chat-assistant-restored.png)) |
| GET | `/pages/generation_admin?token=` | **Token.** Form error says the `token` field is required |
| GET | `/pages/messengers_manage` | **Open page, login inside.** A login screen asks for the admin token |
| GET | `/pages/parser` | **Open page, no login box.** A small file converter page (see below) |
| GET | `/pages/follow_up` | **Open page, login inside.** Another login screen |

## Block list (blocking and unblocking users)

| Method | Path | What I saw |
|---|---|---|
| GET | `/block/all` | **Token** (401) |
| GET | `/block/get?user_id=&platform=` | **Open.** Yes/no answer, [Image 11](../assets/screenshots/11-unauthenticated-lookup-result.png) |
| POST | `/block/add` | **Token** (401) |
| DELETE | `/block/delete` | **Token** (401) |
| POST | `/block/thread/username` | **Unknown.** Saves a username for a thread |

## Bot accounts

| Method | Path | What I saw |
|---|---|---|
| GET | `/bots/all` | **Token** (401) |
| GET | `/bots/check?account_name=&platform=` | **Open.** Tells whether a bot name is taken |
| POST | `/bots/register` | **Local only** (403) |
| DELETE | `/bots/unregister` | **Local only** (403) |
| PATCH | `/bots/toggle` | **Token** (401) |

## Follow-up messages: chat connector side

All seven answered **Local only** (403): `/follow-up/incoming`, `/follow-up/allow-ai`, `/follow-up/ai-delivered`, `/follow-up/deliveries/claim`, `/follow-up/deliveries/{id}/ack`, `/follow-up/manager-reply` and `/follow-up/instagram-echo`.

## Follow-up messages: admin side

| Method | Path | What I saw |
|---|---|---|
| GET | `/follow-up/admin/defaults` | **Token** (401) |
| GET, PUT | `/follow-up/admin/settings` | **Token** on GET (401). PUT not tested |
| GET | `/follow-up/admin/states` | **Token** (401) |
| GET | `/follow-up/admin/deliveries` | **Token** (401) |
| POST | `/follow-up/admin/states/{id}/manual-sent` | **Not tested** |
| POST | `/follow-up/admin/states/{id}/resume` | **Not tested** |
| POST | `/follow-up/admin/deliveries/{id}/resolve` | **Token** (401) |

## File converter (Excel and Word to Markdown)

| Method | Path | What I saw |
|---|---|---|
| POST | `/api/v1/parser/convert` | **Unknown.** Asks for one `.xlsx` or `.docx` file and gave a form error before any login result |
| GET | `/pages/parser` | The page that uses it has **no login box** |

A converter that turns Excel or Word files into Markdown text runs on the company's server. If it is open, an outsider could make the server process files. That is **only a possible concern**: I did not upload a file, so I do not know if it needs a login. A browser tab named "File to Markdown Converter" is visible in [Image 09](../assets/screenshots/09-api-spec-ai-config-fields.png), but that is a separate tool I had open, not proof about this endpoint.

## Totals (from my notes)

| | Count |
|---|---|
| Operations in the spec | 36 |
| Answered **Open** | 5 |
| Need a **Token** | 10 |
| **Local only** | 9 |
| **Unknown** or **Not tested** | the rest |

Early in my notes I wrongly said many endpoints had no login. I corrected that: the spec only shows that no login scheme is written down, while the app checks logins in its own code. The numbers above are the corrected ones.
