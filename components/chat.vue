<template>
  <div class="wa-chat max-w-xl mx-auto mt-5">
    <div class="mb-2 text-sm text-gray-600">Room {{ roomNumber }}</div>

    <!-- Messages -->
    <div ref="list" class="chat-body">
      <div
        v-for="m in messages"
        :key="m.id"
        class="msg"
        :class="m.role === 'guest' ? 'me' : 'them'"
      >
        <div class="bubble">
          <div class="meta">
            <span class="sender">{{ prettySender(m.sender) }}</span>
            <span>· {{ time(m.ts) }}</span>
            <span
              v-if="m.role === 'guest'"
              class="ticks"
              :class="{ read: m.seen }"
            >
              {{ m.seen ? "✓✓" : "✓" }}
            </span>
          </div>

          <div v-if="m.type === 'text'">{{ m.text }}</div>
          <a v-else-if="m.type === 'file'" :href="m.url" target="_blank">
            {{ m.filename || "file" }}
          </a>
          <audio v-else-if="m.type === 'audio'" :src="m.url" controls></audio>
        </div>
      </div>

      <div v-if="typingNames.length" class="typing">
        {{ typingNames.join(", ") }} typing…
      </div>
    </div>

    <!-- Composer -->
    <div class="composer mt-3 flex1 gap-2">
      <input
        v-model="draft"
        @keydown="onKey"
        @input="sendTyping"
        placeholder="Write a message…"
        style="border: 1px solid black; width: 100%"
      />
      <button class="send-btn" @click="send">Send</button>
    </div>

    <!-- Optional: File upload -->
    <div class="mt-6 flex items-center gap-2">
      <br />
      <input type="file" @change="sendFile" />
      <small class="text-gray-500">Optional: send a file</small>
    </div>
  </div>
</template>

<script>
export default {
  name: "GuestChat",
  props: ["hotelId", "bookingId", "roomId", "roomNumber", "guestName"],
  // props: {

  //   // hotelId: { type: [String, Number], required: true },
  //   // bookingId: { type: [String, Number], required: true },
  //   // roomId: { type: [String, Number], required: true },
  //   // roomNumber: { type: [String, Number], required: true },
  //   // guestName: { type: String, default: "Guest" },
  // },
  data: () => ({
    messages: [],
    draft: "",
    typingSet: new Set(), // who is typing (reception)
    typingUnsub: null,
    msgUnsub: null,
    ackUnsub: null,
    _t: null, // typing debounce
    _typingTimers: {}, // auto-clear for typing state
    timezone: "Asia/Kolkata",
  }),
  computed: {
    me() {
      return `${this.roomNumber}:${this.guestName}`;
      //return `${this.bookingId}:${this.bookingId}`;
    },
    msgTopic() {
      return `chat/hotel/${this.hotelId}/room/${String(
        this.roomNumber
      )}/message`;
    },
    typingTopic() {
      return `chat/hotel/${this.hotelId}/room/${String(
        this.roomNumber
      )}/typing`;
    },
    ackTopic() {
      return `chat/hotel/${this.hotelId}/room/${String(this.roomNumber)}/ack`;
    },
    typingNames() {
      return [...this.typingSet].map(this.prettyUser);
    },
  },
  mounted() {
    // Subscribe to messages in this room
    this.msgUnsub = this.$mqtt.sub(this.msgTopic, (m) => {
      if (!m) return;
      this.upsertMessage(m);

      // If from reception, mark as seen
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

    // Subscribe to ACKs (mark our own messages as seen ✓✓)
    this.ackUnsub = this.$mqtt.sub(this.ackTopic, (ack) => {
      const { lastSeenId } = ack || {};
      if (!lastSeenId) return;
      this.messages.forEach((x, idx) => {
        if (x.id === lastSeenId && x.role === "guest" && !x.seen) {
          this.$set(this.messages, idx, { ...x, seen: true });
        }
      });
    });

    // Optional: await this.loadHistory();

    if (this.$auth.user.company?.timezone) {
      this.timezone = this.$auth.user.company.timezone.utc_time_zone;
    }

    // this.currentTime = new Intl.DateTimeFormat("en-US", {
    //   timeZone: timezone, // Specify the desired timezone
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   second: "2-digit",
    //   hour12: false, // 24-hour format
    // }).format(new Date());

    // const now = new Date();
  },
  beforeDestroy() {
    this.msgUnsub && this.msgUnsub();
    this.typingUnsub && this.typingUnsub();
    this.ackUnsub && this.ackUnsub();
    Object.values(this._typingTimers || {}).forEach((t) => clearTimeout(t));
  },
  methods: {
    async loadHistory() {
      try {
        const q = `?hotelId=${this.hotelId}&bookingId=${this.bookingId}&limit=50`;
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
      const [_, name] = String(u || "").split(":");
      return name || u;
    },
    prettySender(s) {
      if (!s) return "";
      if (String(s).startsWith("Reception:")) return s;

      return "Me (" + s + ")";
      const [_, name] = String(s).split(":");
      return name || "Guest";
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
    async send() {
      const text = this.draft.trim();
      if (!text) return;
      let m = {
        id: Date.now() + "_" + Math.random().toString(36).slice(2),
        sender: this.me,
        role: "guest",
        type: "text",
        booking_id: this.bookingId,

        type: "text",

        text,
        ts: Date.now(),
      };
      this.$mqtt.pub(this.msgTopic, m);
      this.upsertMessage(m);
      this.draft = "";
      this.$nextTick(this.scrollToEnd);
      this.ack(m.id);

      //store backup
      try {
        m = {
          room_id: 11,
          room_number: this.roomNumber,

          receiption_name: "receiption_name",
          ...m,
        };

        await this.$axios.post(`/chat_messages`, m);
      } catch (e) {}
    },
    async sendFile(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("hotelId", this.hotelId);
        form.append("bookingId", this.bookingId);
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
      this.$mqtt.pub(this.ackTopic, {
        user: this.me,
        lastSeenId: id,
        ts: Date.now(),
      });
    },
  },
};
</script>

<style scoped>
/* Define theme vars on component root (works with scoped) */
.wa-chat {
  --wa-bg: #e5ddd5; /* wallpaper base */
  --wa-me: #dcf8c6; /* my (guest) bubble */
  --wa-them: #ffffff; /* reception bubble */
  --wa-accent: #25d366; /* send button */
  --wa-read: #34b7f1; /* blue double tick */
  --wa-text: #111b21;
  --wa-sub: #667781;

  height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
  color: var(--wa-text, #111b21);
}

/* Messages area */
.chat-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--wa-bg, #e5ddd5);
  /* background-image: url("https://i.imgur.com/VrQ1S7G.png"); */
  background-repeat: repeat;
  background-size: 400px;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  height: calc(100vh - 100px);
}

/* Rows */
.msg {
  display: flex;
  margin: 8px 0;
}
.msg.them {
  justify-content: flex-start;
}
.msg.me {
  justify-content: flex-end;
}

/* Bubbles */
.bubble {
  position: relative;
  max-width: 78%;
  padding: 10px 12px;
  border-radius: 8px;
  line-height: 1.35;
  background: var(--wa-them, #ffffff);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}
.msg.me .bubble {
  background: var(--wa-me, #dcf8c6);
}

/* Bubble tails */
.msg.them .bubble:after,
.msg.me .bubble:after {
  content: "";
  position: absolute;
  bottom: 0;
  width: 0;
  height: 0;
  border: 10px solid transparent;
}
.msg.them .bubble:after {
  left: -6px;
  border-right-color: var(--wa-them, #ffffff);
  border-left: 0;
  border-bottom: 0;
}
.msg.me .bubble:after {
  right: -6px;
  border-left-color: var(--wa-me, #dcf8c6);
  border-right: 0;
  border-bottom: 0;
}

/* Meta + ticks */
.meta {
  font-size: 11px;
  color: var(--wa-sub, #667781);
  margin-bottom: 4px;
  display: flex;
  gap: 6px;
  align-items: center;
}
.meta .sender {
  font-weight: 500;
}
.ticks {
  margin-left: 4px;
}
.ticks.read {
  color: var(--wa-read, #34b7f1);
}

/* Typing line */
.typing {
  font-size: 12px;
  color: var(--wa-sub, #667781);
  margin-top: 6px;
}

/* Composer */
.composer {
  display: flex;
  gap: 8px;
}
.input {
  border: 1px solid black;
  border-radius: 8px;
  padding: 10px 12px;
  /* outline: none; */
}
.input:focus {
  border-color: #c9c9c9;
}

/* WA green send button */
.send-btn {
  background: var(--wa-accent, #25d366);
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}
.send-btn:hover {
  filter: brightness(0.96);
}
.send-btn:active {
  transform: translateY(1px);
}
</style>
