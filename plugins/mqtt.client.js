import Vue from "vue";
// IMPORTANT: use the UMD build, not "mqtt"
import mqtt from "mqtt/dist/mqtt.min.js";

const WS_URL = "wss://mqtt.xtremeguard.org:8084"; // e.g. ws://emqx.local:8083/mqtt

// MQTT wildcard matcher: supports + and # (single/multi level)
function topicMatches(filter, topic) {
  // fast path: exact string
  if (filter === topic) return true;

  const f = filter.split("/");
  const t = topic.split("/");

  for (let i = 0; i < f.length; i++) {
    const fi = f[i];
    const ti = t[i];

    if (fi === "#") return true; // multi-level wildcard
    if (fi === "+") {
      if (ti == null) return false;
      continue;
    } // single-level
    if (ti == null) return false; // topic shorter than filter
    if (fi !== ti) return false; // literal mismatch
  }
  // if filter ends, topic must also end (unless filter had '#')
  return f[f.length - 1] === "#" || f.length === t.length;
}

export default (_ctx, inject) => {
  if (!process.client) return;

  const client = mqtt.connect(WS_URL, {
    protocol: "wss",
    keepalive: 60,
    reconnectPeriod: 2000,
    connectTimeout: 10000,
    clean: true,
    clientId: "hotelchat_" + Math.random().toString(16).slice(2),
    // username, password if needed
  });

  const api = {
    raw: client,
    sub(filter, cb) {
      client.subscribe(
        filter,
        { qos: 1 },
        (err) => err && console.error("sub", filter, err)
      );
      const handler = (topic, payload) => {
        if (!topicMatches(filter, topic)) return;
        let data = null;
        try {
          data = JSON.parse(payload.toString());
        } catch (_) {
          /* allow non-JSON if you want: data = payload.toString(); */
        }
        cb(data, topic);
      };
      client.on("message", handler);
      // return unsubscribe fn for this specific handler
      return () => client.off("message", handler);
    },
    pub(topic, msg) {
      const payload = typeof msg === "string" ? msg : JSON.stringify(msg);
      client.publish(topic, payload, { qos: 1 });
    },
  };

  client.on("connect", () => console.log("[MQTT] connected"));
  client.on("reconnect", () => console.log("[MQTT] reconnecting…"));
  client.on("error", (e) => console.error("[MQTT] error", e));
  client.on("close", () => console.log("[MQTT] closed"));

  Vue.prototype.$mqtt = api;
  inject("mqtt", api);
};
