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
        <div class="text-xs opacity-60">{{ who(m) }} · {{ time(m.ts) }}</div>
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
    typing: new Set(),
    stopTimer: null,
    unsub: [],
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
      return [...this.typing];
    },
  },
  async mounted() {
    // Load history (optional)
    try {
      const q = `?hotelId=${this.hotelId}&roomId=${this.roomId}&limit=50`;
      const { data } = await this.$axios.get(`/api/chat/history${q}`);
      this.messages = data || [];
      this.$nextTick(this.scrollToEnd);
    } catch (e) {
      /* no history */
    }

    this.unsub.push(
      this.$mqtt.sub(this.msgTopic, (m) => {
        this.messages.push(m);
        this.$nextTick(this.scrollToEnd);
        this.ack(m.id);
      })
    );
    this.unsub.push(
      this.$mqtt.sub(this.typeTopic, (t) => {
        if (t.user !== this.me) {
          if (t.typing) this.typing.add(t.user);
          else this.typing.delete(t.user);
        }
      })
    );

    // initial ack of last loaded message
    if (this.messages.length)
      this.ack(this.messages[this.messages.length - 1].id);
  },
  beforeDestroy() {
    this.unsub.forEach((fn) => fn && fn());
  },
  methods: {
    id() {
      return Date.now() + "_" + Math.random().toString(36).slice(2);
    },
    who(m) {
      return m.role === "guest" ? this.guestName : m.sender || "Reception";
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
      el.scrollTop = el.scrollHeight;
    },
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
      this.messages.push(m);
      this.draft = "";
      this.stopTyping();
      this.$nextTick(this.scrollToEnd);
      this.ack(m.id);
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
      this.messages.push(m);
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
        // Upload blob -> get URL; demo:
        const m = {
          id: this.id(),
          sender: this.me,
          role: "guest",
          type: "audio",
          url: URL.createObjectURL(blob),
          ts: Date.now(),
        };
        this.$mqtt.pub(this.msgTopic, m);
        this.messages.push(m);
        this.$nextTick(this.scrollToEnd);
      };
      rec.start();
      setTimeout(() => rec.stop(), 5000);
    },
  },
};
</script>
