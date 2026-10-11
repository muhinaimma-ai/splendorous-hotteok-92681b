// Netlify Function: ChatSite push notifications (arifa hata site ikifungwa).
import { buildPushHTTPRequest } from "@pushforge/builder";

const DB = "https://chatsite-c1b34-default-rtdb.europe-west1.firebasedatabase.app/supportChats";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });

const safeId = (s) => typeof s === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(s);

async function db(path, method = "GET", body) {
  const r = await fetch(`${DB}/${path}.json`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? null : JSON.stringify(body),
  });
  return r.ok ? r.json() : null;
}

async function hashKey(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b).slice(0, 12))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

async function pushTo(path, payload) {
  const raw = process.env.VAPID_PRIVATE_JWK;
  if (!raw) return 0;
  const privateJWK = JSON.parse(raw);
  const subs = (await db(path)) || {};
  let sent = 0;
  await Promise.all(
    Object.entries(subs).map(async ([k, sub]) => {
      try {
        const req = await buildPushHTTPRequest({
          privateJWK,
          subscription: sub,
          message: { payload, adminContact: "mailto:admin@chatsite.app", options: { ttl: 86400, urgency: "high" } },
        });
        const r = await fetch(req.endpoint, { method: "POST", headers: req.headers, body: req.body });
        if (r.status === 404 || r.status === 410) await db(`${path}/${k}`, "DELETE");
        else if (r.ok) sent++;
      } catch {
        /* ignore bad subscription */
      }
    }),
  );
  return sent;
}

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  if (request.method !== "POST") return json({ error: "method" }, 405);

  let b;
  try {
    b = await request.json();
  } catch {
    return json({ error: "bad json" }, 400);
  }

  if (b.action === "subscribe") {
    const role = b.role === "agent" ? "agent" : "user";
    const id = role === "agent" ? "all" : b.id;
    const sub = b.sub;
    if (!safeId(id) || !sub?.endpoint?.startsWith("https://") || !sub.keys?.p256dh || !sub.keys?.auth)
      return json({ error: "invalid" }, 400);
    const k = await hashKey(sub.endpoint);
    await db(`_push/${role}/${id}/${k}`, "PUT", {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });
    return json({ ok: true });
  }

  if (b.action === "send") {
    const room = b.room;
    if (!safeId(room)) return json({ error: "invalid" }, 400);
    const last = await db(`${room}/last`);
    if (!last?.text || Date.now() - (last.time || 0) > 2 * 60 * 1000) return json({ ok: false });
    const text = String(last.text).slice(0, 160);
    if (b.to === "agent" && last.from === "user") {
      const idx = await db(`_index/${room}`);
      const sent = await pushTo("_push/agent/all", {
        title: `🔔 Ujumbe mpya kutoka ${idx?.name || "mteja"}`,
        body: text,
        tag: `room-${room}`,
        url: "./index.html#support-admin",
      });
      return json({ ok: true, sent });
    }
    if (b.to === "user" && last.from === "agent") {
      const sent = await pushTo(`_push/user/${room}`, {
        title: "💬 Umepokea ujumbe kutoka ChatSite",
        body: text,
        tag: "support",
        url: "./index.html#help",
      });
      return json({ ok: true, sent });
    }
    return json({ ok: false });
  }
  return json({ error: "unknown action" }, 400);
};
