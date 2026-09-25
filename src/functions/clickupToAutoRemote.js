const { app } = require("@azure/functions");

app.http("clickupToAutoRemote", {
  methods: ["GET", "POST"],
  authLevel: "function",
  route: "clickupToAutoRemote",

  handler: async (request, context) => {
    try {
      const key = process.env.AUTOREMOTE_KEY;
      const message =
        process.env.AUTOREMOTE_MESSAGE || "clickup_hourly";

      if (!key) {
        return {
          status: 500,
          jsonBody: {
            ok: false,
            error: "AUTOREMOTE_KEY is not configured"
          }
        };
      }

      const url = new URL(
        "https://autoremotejoaomgcd.appspot.com/sendmessage"
      );

      url.searchParams.set("key", key.trim());
      url.searchParams.set("message", message.trim());

      const response = await fetch(url, {
        method: "POST"
      });

      const autoRemoteBody = await response.text();

      if (!response.ok) {
        return {
          status: 502,
          jsonBody: {
            ok: false,
            error: "AutoRemote delivery failed",
            autoRemoteStatus: response.status,
            autoRemoteBody
          }
        };
      }

      return {
        status: 200,
        jsonBody: {
          ok: true,
          relayed: true,
          message: message.trim(),
          autoRemoteStatus: response.status,
          autoRemoteBody
        }
      };
    } catch (e) {
      context.error(e);

      return {
        status: 500,
        jsonBody: {
          ok: false,
          error: "Unexpected relay error"
        }
      };
    }
  }
});
