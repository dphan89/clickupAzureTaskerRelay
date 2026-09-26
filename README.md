# ClickUp → AutoRemote → Tasker relay

Flow:
ClickUp Chat message posted → Azure Function → AutoRemote `clickup_hourly` → Tasker → ClickUp API → WaveNet.

## Azure app settings
Add these in the Function App configuration:
- `AUTOREMOTE_KEY` = your AutoRemote key
- `AUTOREMOTE_MESSAGE` = `clickup_hourly`

Do not commit the real AutoRemote key.

## Function URL
The function route is:
`/api/clickupToAutoRemote`

Use the full Azure Function URL, including its `code=` value, as the ClickUp webhook URL.

# ClickUp → AutoRemote → Tasker relay

Flow:
ClickUp task comment posted → Azure Function → AutoRemote `clickup_hourly` → Tasker → ClickUp API → WaveNet.

ClickUp Chat channel messages do not have a documented webhook event. Create the
webhook for `taskCommentPosted` scoped to Donald's Personal Workspace Space,
not the entire Workspace (which also includes Work Tasks at Pro Software).

## Azure app settings
Add these in the Function App configuration:
- `AUTOREMOTE_KEY` = your AutoRemote key
- `AUTOREMOTE_MESSAGE` = `clickup_hourly`
- `CLICKUP_WEBHOOK_SECRET` = the `webhook.secret` returned by ClickUp when the webhook is created
- `CLICKUP_WEBHOOK_ID` = the returned webhook ID (recommended)

Do not commit the real AutoRemote key.

## Function URL
The function route is:
`/api/clickupToAutoRemote`

Use the full Azure Function URL, including its `code=` value, as the ClickUp webhook URL.
Create a ClickUp API webhook with `events: ["taskCommentPosted"]` and
`space_id: 90148874172` for Workspace `90141689011`. The endpoint must be
reachable over HTTPS. Set the returned secret and ID as Azure app settings,
then deploy this code. Do not put either value in GitHub.

POST requests must have a valid ClickUp `X-Signature`. Other signed events are
acknowledged but ignored. GET with the Azure function key remains a manual
AutoRemote trigger. The relay sends only the fixed `clickup_hourly` trigger;
Tasker currently reads ClickUp separately for the spoken text.

## Tasker
Create an AutoRemote Message profile matching:
`clickup_hourly`

Have it run your existing direct ClickUp reader task.
## Tasker
Create an AutoRemote Message profile matching:
`clickup_hourly`

Have it run your existing direct ClickUp reader task.
