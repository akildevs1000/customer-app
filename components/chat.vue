<template>
  <div class="wa-chat max-w-xl mx-auto mt-5">
    <div class="mb-2 text-sm text-gray-600">Room {{ roomNumber }}</div>

    <!-- Messages -->
    <div ref="list" class="chat-body">
      <div class="flex" v-if="messages.length == 0">
        No Chat History is available
      </div>
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
            <!-- <span
              v-if="m.role === 'guest'"
              class="ticks"
              :class="{ read: m.seen }"
            >
              {{ m.seen ? "✓✓" : "✓" }}
            </span> -->
            <!-- <span v-if="m.role === 'guest'" class="ticks"> ✓ </span> -->
          </div>

          <div v-if="m.type === 'text'">{{ m.text }}</div>
          <a v-else-if="m.type === 'file'" :href="m.url" target="_blank">
            <!-- {{ m.filename || "file" }} -->
            Image
          </a>
          <audio v-else-if="m.type === 'audio'" :src="m.url" controls></audio>
        </div>
      </div>

      <!-- <div v-if="typingNames.length" class="typing">
        {{ typingNames.join(", ") }} typing…
      </div> -->
    </div>

    <!-- Composer -->
    <div class="composer mt-3 flex1 gap-2">
      <input
        ref="messageInput"
        v-model="draft"
        @keydown="onKey"
        @input="sendTyping"
        placeholder="Write a message…"
        style="border: 1px solid black; width: 100%"
      />
      <button class="send-btn" @click="send">Send</button>
    </div>
    <!--  -->
    <!-- Optional: File upload -->
    <div class="mt-6 flex items-center gap-2">
      <br />
      <input type="file" @change="sendFile" />
      <small class="text-gray-500">Optional: send a file</small>
    </div>
    <br />
    <br />
    <br />
  </div>
</template>

<script>
export default {
  name: "GuestChat",
  props: [
    "hotelId",
    "bookingId",
    "bookingRoomId",
    "roomId",
    "roomNumber",
    "guestName",
  ],

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
      //return `${this.bookingRoomId}:${this.bookingRoomId}`;
    },
    msgTopic() {
      return `chat/hotel/${this.hotelId}/room/${String(
        this.bookingRoomId
      )}/message`;
    },
    typingTopic() {
      return `chat/hotel/${this.hotelId}/room/${String(
        this.bookingRoomId
      )}/typing`;
    },
    ackTopic() {
      return `chat/hotel/${this.hotelId}/room/${String(
        this.bookingRoomId
      )}/ack`;
    },
    typingNames() {
      return [...this.typingSet].map(this.prettyUser);
    },
  },
  async mounted() {
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

      console.log(lastSeenId);

      if (!lastSeenId) return;
      this.messages.forEach((x, idx) => {
        if (x.id === lastSeenId && x.role === "guest" && !x.seen) {
          this.$set(this.messages, idx, { ...x, seen: true });
        }
      });
    });

    // Optional: await this.loadHistory();
    await this.loadHistory();

    // if (this.$auth.user.company?.timezone) {
    //   this.timezone = this.$auth.user.company.timezone.utc_time_zone;
    // }

    this.$refs.messageInput.focus();
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
        const q = `?company_id=${this.hotelId}&booking_room_id=${this.bookingRoomId}&limit=50`;
        const rows =
          (await this.$axios.get(`/chat_messages_history${q}`)) || [];
        this.messages = rows.data;
        setTimeout(() => {
          this.scrollToEnd();
        }, 1000 * 2);
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
        booking_room_id: this.bookingRoomId,
        type: "text",
        text,
        ts: Date.now(),
        room_id: this.roomId,
        room_number: this.roomNumber,
        company_id: this.hotelId,
      };
      this.$mqtt.pub(this.msgTopic, m);
      this.upsertMessage(m);
      this.draft = "";
      this.$nextTick(this.scrollToEnd);
      this.ack(m.id);

      //store backup
      try {
        // m = {
        //   room_id: roomId,
        //   room_number: this.roomNumber,
        //   company_id: this.company_id,

        //   // receiption_name: "receiption_name",
        //   ...m,
        // };

        await this.$axios.post(`/chat_messages`, m);
      } catch (e) {}
    },
    async sendFile(e) {
      const file = e.target.files && e.target.files[0];

      console.log(file);

      if (!file) return;
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("sender", this.me);
        form.append("role", "guest");
        form.append("type", "file");
        form.append("ts", Date.now());

        form.append("booking_id", this.bookingId);
        form.append("booking_room_id", this.bookingRoomId);
        form.append("room_id", this.roomId);
        form.append("room_number", this.roomNumber);
        form.append("company_id", this.hotelId);

        const res = await this.$axios.post("/chat_messages_upload_file", form);

        const url = res && res.data.message;

        const m = {
          id: Date.now() + "_" + Math.random().toString(36).slice(2),
          sender: this.me,
          role: "guest",
          type: "file",
          url: url,
          filename: "image",
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
