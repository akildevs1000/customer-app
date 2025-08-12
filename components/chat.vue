<template>
  <div class="max-w-xl mx-auto">
    <div class="mb-2 text-sm text-gray-600">
      Hotel {{ hotelId }} · Room {{ roomId }}
    </div>

    <!-- Messages -->
    <div
      ref="list"
      class="border rounded p-3"
      style="height: 420px; overflow: auto"
    >
      <div v-for="m in messages" :key="m.id" class="mb-2" :style="bubble(m)">
        <div class="text-xs opacity-60">
          {{ prettySender(m.sender) }} · {{ time(m.ts) }}
          <span v-if="m.role === 'guest'">
            · <span v-if="m.seen" title="Seen by reception">✓✓</span
            ><span v-else>✓</span>
          </span>
        </div>

        <div v-if="m.type === 'text'">{{ m.text }}</div>
        <a v-else-if="m.type === 'file'" :href="m.url" target="_blank">
          {{ m.filename || "file" }}
        </a>
        <audio v-else-if="m.type === 'audio'" :src="m.url" controls></audio>
      </div>

      <div v-if="typingNames.length" class="text-xs opacity-60 mt-2">
        {{ typingNames.join(", ") }} typing…
      </div>
    </div>

    <!-- Composer -->
    <div class="mt-3 flex gap-2">
      <input
        v-model="draft"
        @keydown="onKey"
        @input="sendTyping"
        class="flex-1 border rounded px-3 py-2"
        placeholder="Write a message…"
      />
      <button class="px-3 py-2 rounded bg-blue-600 text-white" @click="send">
        Send
      </button>
    </div>

    <!-- Optional: File upload -->
    <div class="mt-2 flex items-center gap-2">
      <input type="file" @change="sendFile" />
      <small class="text-gray-500">Optional: send a file</small>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    hotelId: { type: [String, Number], required: true },
    roomId: { type: [String, Number], required: true },
    guestName: { type: String, default: "Guest" },
  },
  data: () => ({
    messages: [],
    draft: "",
    typingSet: new Set(), // who is typing (reception)
    typingUnsub: null,
    msgUnsub: null,
    ackUnsub: null,
    _t: null, // typing debounce
    _typingTimers: {}, // auto-clear for typing state
  }),
  computed: {
    me() {
      // sender string to match your reception format "Reception:Name"
      // We’ll use "{roomId}:Guest" so reception can pretty-print it
      return `${this.roomId}:${this.guestName}`;
    },
    msgTopic() {
      return `chat/hotel/${this.hotelId}/room/${String(this.roomId)}/message`;
    },
    typingTopic() {
      return `chat/hotel/${this.hotelId}/room/${String(this.roomId)}/typing`;
    },
    ackTopic() {
      return `chat/hotel/${this.hotelId}/room/${String(this.roomId)}/ack`;
    },
    typingNames() {
      // Show “Reception” etc.
      return [...this.typingSet].map(this.prettyUser);
    },
  },
  async mounted() {
    // Subscribe to messages in this room
    this.msgUnsub = this.$mqtt.sub(this.msgTopic, (m) => {
      if (!m) return;
      this.upsertMessage(m);

      // If message is from reception, acknowledge as seen
      if (m.role === "reception") {
        this.$nextTick(() => {
          this.scrollToEnd();
          this.ack(m.id);
        });
      } else {
        this.$nextTick(this.scrollToEnd);
      }
    });

    // Subscribe to typing
    this.typingUnsub = this.$mqtt.sub(this.typingTopic, (t) => {
      const timerKey = `typing:${t?.user || ""}`;
      clearTimeout(this._typingTimers?.[timerKey]);
      this._typingTimers = this._typingTimers || {};

      if (t && t.typing) {
        this.typingSet.add(t.user);
        this._typingTimers[timerKey] = setTimeout(() => {
          this.typingSet.delete(t.user);
          this.$forceUpdate();
        }, 3000);
      } else {
        this.typingSet.delete(t && t.user);
      }
      this.$forceUpdate();
    });

    // Subscribe to ACKs (so guest can mark own messages as seen✓✓)
    this.ackUnsub = this.$mqtt.sub(this.ackTopic, (ack) => {
      const { lastSeenId } = ack || {};
      if (!lastSeenId) return;
      this.messages.forEach((x, idx) => {
        if (x.id === lastSeenId && x.role === "guest" && !x.seen) {
          this.$set(this.messages, idx, { ...x, seen: true });
        }
      });
    });

    // Optionally load history here (if you have an API):
    // await this.loadHistory();
  },
  beforeDestroy() {
    this.msgUnsub && this.msgUnsub();
    this.typingUnsub && this.typingUnsub();
    this.ackUnsub && this.ackUnsub();
    Object.values(this._typingTimers || {}).forEach((t) => clearTimeout(t));
  },
  methods: {
    // Optional: load last N messages
    async loadHistory() {
      try {
        const q = `?hotelId=${this.hotelId}&roomId=${this.roomId}&limit=50`;
        const rows = (await this.$axios.$get(`/api/chat/history${q}`)) || [];
        this.messages = rows;
        this.$nextTick(this.scrollToEnd);
      } catch (_) {}
    },

    upsertMessage(msg) {
      const i = this.messages.findIndex((x) => x.id === msg.id);
      if (i === -1) this.messages.push(msg);
      else this.$set(this.messages, i, { ...this.messages[i], ...msg });
    },

    prettyUser(u) {
      const [rid, name] = String(u || "").split(":");
      return name || u;
    },
    prettySender(s) {
      // Show “Reception” or “Guest”
      if (!s) return "";
      if (String(s).startsWith("Reception:")) return "Reception";
      const [rid, name] = String(s).split(":");
      return name || "Guest";
    },

    bubble(m) {
      const mine = m.role === "guest";
      return {
        maxWidth: "85%",
        marginLeft: mine ? "auto" : "0",
        background: mine ? "#e3f2fd" : "#f5f5f5",
        borderRadius: "14px",
        padding: "8px 12px",
      };
    },
    time(ts) {
      return new Date(ts).toLocaleTimeString();
    },
    scrollToEnd() {
      const el = this.$refs.list;
      if (el) el.scrollTop = el.scrollHeight;
    },

    onKey(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    },

    sendTyping() {
      this.$mqtt.pub(this.typingTopic, {
        user: this.me,
        typing: true,
        ts: Date.now(),
      });
      clearTimeout(this._t);
      this._t = setTimeout(() => {
        this.$mqtt.pub(this.typingTopic, {
          user: this.me,
          typing: false,
          ts: Date.now(),
        });
      }, 1200);
    },

    send() {
      const text = this.draft.trim();
      if (!text) return;
      const m = {
        id: Date.now() + "_" + Math.random().toString(36).slice(2),
        sender: this.me,
        role: "guest",
        type: "text",
        text,
        ts: Date.now(),
      };
      this.$mqtt.pub(this.msgTopic, m);
      this.upsertMessage(m);
      this.draft = "";
      this.$nextTick(this.scrollToEnd);
      // Optionally ack own message (not required)
      this.ack(m.id);
    },

    async sendFile(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      // You likely want to upload to your server and then publish the URL.
      // Below is a minimal example using a presumed API:
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("hotelId", this.hotelId);
        form.append("roomId", this.roomId);
        const res = await this.$axios.$post("/api/chat/upload", form);
        const url = res && res.url;

        const m = {
          id: Date.now() + "_" + Math.random().toString(36).slice(2),
          sender: this.me,
          role: "guest",
          type: "file",
          url,
          filename: file.name,
          ts: Date.now(),
        };
        this.$mqtt.pub(this.msgTopic, m);
        this.upsertMessage(m);
        this.$nextTick(this.scrollToEnd);
        this.ack(m.id);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        e.target.value = "";
      }
    },

    ack(id) {
      // Tell reception what we’ve seen
      this.$mqtt.pub(this.ackTopic, {
        user: this.me,
        lastSeenId: id,
        ts: Date.now(),
      });
    },
  },
};
</script>
