<template>
  <div class="p-4" style="max-width: 560px">
    <div class="mb-2 text-sm text-gray-600">
      Room {{ roomId }} · Hotel {{ hotelId }}
    </div>

    <div
      ref="list"
      class="border rounded p-3"
      style="height: 340px; overflow: auto"
    >
      <div v-for="m in messages" :key="m.id" class="mb-2" :style="bubble(m)">
        <div class="text-xs opacity-60">
          {{ who(m) }} · {{ time(m.ts) }}
          <span v-if="m.role === 'guest'">
            · <span v-if="m.seen">✓✓</span><span v-else>✓</span>
          </span>
        </div>
        <div v-if="m.type === 'text'">{{ m.text }}</div>
        <a v-else-if="m.type === 'file'" :href="m.url" target="_blank">{{
          m.filename || "file"
        }}</a>
        <audio v-else-if="m.type === 'audio'" :src="m.url" controls></audio>
      </div>

      <div v-if="typingNames.length" class="text-xs opacity-60 mt-2">
        {{ typingNames.join(", ") }} typing…
      </div>
    </div>

    <div class="mt-3 flex gap-2">
      <input
        v-model="draft"
        @keydown="onKey"
        @input="sendTyping"
        class="flex-1 border rounded px-3 py-2"
        placeholder="Type a message…"
      />
      <button class="px-3 py-2 rounded bg-blue-600 text-white" @click="send">
        Send
      </button>
      <input ref="file" type="file" class="hidden" @change="attach" />
      <button class="px-3 py-2 rounded border" @click="$refs.file.click()">
        Attach
      </button>
      <button class="px-3 py-2 rounded border" @click="record">🎤</button>
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
    typing: new Set(), // users currently typing
    typingTimers: {}, // auto-clear per user
    stopTimer: null, // local typing debounce
    unsub: [], // generic unsubs
    ackUnsub: null, // ack topic unsub
    lastSeenId: null,
  }),
  computed: {
    msgTopic() {
      return `chat/hotel/${this.hotelId}/room/${this.roomId}/message`;
    },
    typeTopic() {
      return `chat/hotel/${this.hotelId}/room/${this.roomId}/typing`;
    },
    ackTopic() {
      return `chat/hotel/${this.hotelId}/room/${this.roomId}/ack`;
    },
    me() {
      return `${this.roomId}:${this.guestName}`;
    },
    typingNames() {
      // Pretty labels for typing users
      return [...this.typing].map(this.prettyUser);
    },
  },
  async mounted() {
    // (Optional) load history
    try {
      const q = `?hotelId=${this.hotelId}&roomId=${this.roomId}&limit=50`;
      const { data } = await this.$axios.get(`/api/chat/history${q}`);
      this.messages = (data || []).slice();
      this.$nextTick(this.scrollToEnd);
    } catch (_) {}

    // messages
    this.unsub.push(
      this.$mqtt.sub(this.msgTopic, (m) => {
        if (!m) return;
        this.upsertMessage(m);
        this.$nextTick(this.scrollToEnd);
        // acknowledge receipt (guest has seen it)
        this.ack(m.id);
      })
    );

    // typing
    this.unsub.push(
      this.$mqtt.sub(this.typeTopic, (t) => {
        if (!t || !t.user || t.user === this.me) return;
        const key = t.user;
        clearTimeout(this.typingTimers[key]);

        if (t.typing) {
          this.typing.add(key);
          // auto clear after 3s in case 'typing:false' is lost
          this.typingTimers[key] = setTimeout(() => {
            this.typing.delete(key);
            this.$forceUpdate();
          }, 3000);
        } else {
          this.typing.delete(key);
        }
        this.$forceUpdate(); // Sets aren’t reactive in Vue2
      })
    );

    // acks (mark my messages as seen when reception views them)
    this.ackUnsub = this.$mqtt.sub(this.ackTopic, (ack) => {
      if (!ack || !ack.lastSeenId) return;
      // Only mark as seen if the ACK comes from reception (not me)
      if (ack.user && ack.user !== this.me) {
        const i = this.messages.findIndex((x) => x.id === ack.lastSeenId);
        if (i !== -1 && !this.messages[i].seen) {
          this.$set(this.messages, i, { ...this.messages[i], seen: true });
        }
      }
    });

    // initial ack of last history message
    if (this.messages.length)
      this.ack(this.messages[this.messages.length - 1].id);
  },
  beforeDestroy() {
    this.unsub.forEach((fn) => fn && fn());
    if (this.ackUnsub) this.ackUnsub();
    Object.values(this.typingTimers).forEach((t) => clearTimeout(t));
  },
  methods: {
    // ---------- helpers ----------
    id() {
      return Date.now() + "_" + Math.random().toString(36).slice(2);
    },
    prettyUser(u) {
      const [rid, name] = String(u || "").split(":");
      return name && rid ? `${name} ${rid}` : name || u;
    },
    who(m) {
      if (m.role === "guest") return this.guestName;
      // format "Reception:Aisha" => "Reception Aisha"
      return this.prettyUser(m.sender || "Reception");
    },
    time(ts) {
      return new Date(ts).toLocaleTimeString();
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
    scrollToEnd() {
      const el = this.$refs.list;
      if (el) el.scrollTop = el.scrollHeight;
    },
    upsertMessage(msg) {
      const i = this.messages.findIndex((x) => x.id === msg.id);
      if (i === -1) this.messages.push(msg);
      else this.$set(this.messages, i, { ...this.messages[i], ...msg });
    },

    // ---------- actions ----------
    send() {
      const text = this.draft.trim();
      if (!text) return;
      const m = {
        id: this.id(),
        sender: this.me,
        role: "guest",
        type: "text",
        text,
        ts: Date.now(),
      };
      this.$mqtt.pub(this.msgTopic, m);
      this.upsertMessage(m); // de-dupe (don’t double when echoed back)
      this.draft = "";
      this.stopTyping();
      this.$nextTick(this.scrollToEnd);
      this.ack(m.id); // mark as seen locally (guest has seen own message)
    },

    onKey(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    },

    sendTyping() {
      this.$mqtt.pub(this.typeTopic, {
        user: this.me,
        typing: true,
        ts: Date.now(),
      });
      clearTimeout(this.stopTimer);
      this.stopTimer = setTimeout(this.stopTyping, 1200);
    },
    stopTyping() {
      this.$mqtt.pub(this.typeTopic, {
        user: this.me,
        typing: false,
        ts: Date.now(),
      });
    },

    ack(id) {
      this.lastSeenId = id;
      this.$mqtt.pub(this.ackTopic, {
        user: this.me,
        lastSeenId: id,
        ts: Date.now(),
      });
    },

    async attach(e) {
      const file = e.target.files[0];
      if (!file) return;
      // Upload to your API -> returns { url, filename }
      // const fd = new FormData(); fd.append('file', file);
      // const { data } = await this.$axios.post('/api/chat/upload', fd);
      const temp = { url: URL.createObjectURL(file), filename: file.name }; // demo
      const m = {
        id: this.id(),
        sender: this.me,
        role: "guest",
        type: "file",
        ...temp,
        ts: Date.now(),
      };
      this.$mqtt.pub(this.msgTopic, m);
      this.upsertMessage(m);
      this.$nextTick(this.scrollToEnd);
    },

    async record() {
      if (!navigator.mediaDevices?.getUserMedia)
        return alert("Microphone not available");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        // Upload -> get URL; demo:
        const m = {
          id: this.id(),
          sender: this.me,
          role: "guest",
          type: "audio",
          url: URL.createObjectURL(blob),
          ts: Date.now(),
        };
        this.$mqtt.pub(this.msgTopic, m);
        this.upsertMessage(m);
        this.$nextTick(this.scrollToEnd);
      };
      rec.start();
      setTimeout(() => rec.stop(), 5000);
    },
  },
};
</script>
