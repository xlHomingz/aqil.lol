# Lessons Learned

## Technical

- **Public on purpose still needs review.** `robots.txt` and API descriptions are meant to be read, but they point to other things. Each path they show should be public on purpose.
- **Data routes need an explicit permission check.** The main problem is a common one: a route returned data without asking who was calling. "Deny by default" is safer.
- **Protect your logs.** The exposed records were form logs. A log of personal data is a data store and needs the same care.
- **Hide raw errors from visitors.** Show a friendly message and send the details to monitoring.
- **Keep internal instructions out of public files.** An API description should not carry business instructions as default values.

## Process and ethics

- **Stop early when personal data appears.** I confirmed the exposure and stopped. Next time I will cover personal data when I take the screenshot, and delete originals when the case is closed.
- **Report fast, with enough detail to route it.** One short line about the type of problem and the data involved helps more than "I found vulnerabilities".
- **Keep sensitive details out of email.** Share them through a safer channel once someone replies.
- **Be clear about what is certain.** This write-up separates what I saw, what I remember, and what I suspect. That habit matters more than any single finding.

## Communication

- **A reply is part of security.** Two lines are enough to confirm ownership, build trust and tell the reporter what to do next.
- **Publish a way to be told.** A `security.txt` file or a security email address, plus a promise to answer in a few days, turns a stranger's discovery into a normal ticket.
- **Stay fair.** A clear, calm follow-up works better than frustration.

- **Silent fixes make it hard to learn.** Two of my findings were closed without a message. I cannot tell whether my report helped, so I cannot tell if the company wants more information.

## What I would do differently

1. Look for a security contact before writing.
2. Put one clear paragraph in the first email.
3. Record the exact time of each check and of the fix.
4. Cover personal data in screenshots right away.
5. Wait to publish until every reported item is closed or the company has answered.
