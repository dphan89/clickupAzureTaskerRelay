const { app } = require("@azure/functions");
const { createHmac, timingSafeEqual } = require("node:crypto");

function validSignature(body, signature, secret) {
  if (!signature || !secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

app.http("clickupToAutoRemote", {
  methods: ["GET", "POST"],
  authLevel: "function",
  route: "clickupToAutoRemote",

  handler: async (request, context) => {
    try {
      if (request.method === "POST") {
        const body = await request.text();
        if (!validSignature(body, request.headers.get("x-signature"), process.env.CLICKUP_WEBHOOK_SECRET)) {
          return { status: 401, jsonBody: { ok: false, error: "Invalid ClickUp signature" } };
        }
        let payload;
        try {
          payload = JSON.parse(body);
        } catch {
          return { status: 400, jsonBody: { ok: false, error: "Invalid JSON" } };
        }
        if (payload.event !== "taskCommentPosted") {
          return { status: 200, jsonBody: { ok: true, ignored: payload.event } };
        }
        if (process.env.CLICKUP_WEBHOOK_ID && payload.webhook_id !== process.env.CLICKUP_WEBHOOK_ID) {
          return { status: 401, jsonBody: { ok: false, error: "Unknown webhook" } };
        }
      }

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
