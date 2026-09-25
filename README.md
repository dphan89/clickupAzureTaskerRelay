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

## Tasker
Create an AutoRemote Message profile matching:
`clickup_hourly`

Have it run your existing direct ClickUp reader task.
