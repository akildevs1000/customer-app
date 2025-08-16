<template>
  <div class="wa-chat max-w-xl mx-auto mt-5">
    <div class="mb-2 text-sm text-gray-600">Room {{ roomNumber }}</div>
    <v-dialog
      v-model="DialogpreviewImage"
      width="400px"
      max-width="100%"
      style="max-width: 100% !important; margin: 0px !important"
    >
      <v-card>
        <v-card-title dense class="primary white--text background">
          <span>
            Image
            <!-- Download

            <a :href="previewImageUrl" download target="_blank">
              <v-icon outlined dark color="white"> mdi-download-box </v-icon></a
            > -->
          </span>
          <v-spacer> </v-spacer>
          <v-spacer></v-spacer>

          <v-icon
            @click="DialogpreviewImage = false"
            outlined
            dark
            color="white"
          >
            mdi mdi-close-circle
          </v-icon>
        </v-card-title>
        <v-card-text style="" class="pt-2">
          <img
            :src="previewImageUrl"
            style="width: 100%; border-radius: 10px; text-align: right"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
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

          <div v-else-if="m.type === 'file'" style="text-align: center">
            <img
              :src="m.url"
              @click="viewImage(m.id, m.url)"
              style="
                margin: auto;
                width: 100px;
                border-radius: 10px;
                text-align: right;
              "
            />
            <!-- <img
              :src="m.url"
              @click="downloadImage(m.id)"
              style="width: 100px; border-radius: 10px; text-align: right"
            /> -->
            <!-- <a :href="m.url" target="_blank">
                {{ m.filename || "file" }}
              View
            </a> -->
          </div>

          <audio
            style="height: 28px"
            v-else-if="m.type === 'audio'"
            :src="m.url"
            controls
            controlsList="nodownload"
            preload="none"
          ></audio>
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
        placeholder=" Write a message…"
        style="border: 1px solid black; width: 100%; border-radius: 5px"
      />
      <v-icon
        size="20"
        style="color: black"
        :color="selectedFile ? 'blue' : ''"
        left
        @click="$refs.fileInput.click()"
        >mdi-paperclip</v-icon
      >
      <div v-if="selectedFile">
        <!-- File -->
        <v-icon color="red" @click="selectedFile = null"
          >mdi-delete-circle-outline</v-icon
        >
      </div>
      <div style="margin: auto">
        <v-icon
          size="20"
          style="color: black; margin-top: 4px"
          @click="startRec"
          v-if="!recording"
          :disabled="recording"
          >mdi-microphone</v-icon
        >
        <span v-else :style="recording ? 'width:120px' : 'width:50px'">
          <v-icon
            class="flex"
            size="20"
            color="red"
            @click="stopRec"
            :disabled="!recording"
            style="color: red; margin-top: 4px"
            >mdi-microphone</v-icon
          >

          <span v-if="recording">{{ seconds }}s</span>
        </span>
      </div>
      <button class="send-btn" @click="send">Send</button>

      <input
        style="display: none"
        accept="image/*"
        type="file"
        ref="fileInput"
        @change="handleFileSelect"
      />
    </div>
    <!-- <div class="mt-6 flex items-center gap-2">
      <v-row
        ><v-col
          ><input type="file" ref="fileInput" @change="handleFileSelect"
        /></v-col>
        <v-col cols="4" class="text-right">
          <button class="send-btn" small @click="sendFile">
            <v-icon left @click="$refs.fileInput.click()">mdi-paperclip</v-icon>
            Send File
          </button>
        </v-col>
      </v-row>

       </div> -->
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
    mediaRecorder: null,
    chunks: [],
    recording: false,
    startTs: null,
    seconds: 0,
    tmr: null,
    messages: [],
    draft: "",
    typingSet: new Set(), // who is typing (reception)
    typingUnsub: null,
    msgUnsub: null,
    ackUnsub: null,
    _t: null, // typing debounce
    _typingTimers: {}, // auto-clear for typing state
    timezone: "Asia/Kolkata",
    selectedFile: null,
    previewImageUrl: null,
    DialogpreviewImage: null,
    previewImageId: null,
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
    try {
      this.$refs.messageInput.focus();
    } catch (e) {}
  },
  beforeDestroy() {
    this.msgUnsub && this.msgUnsub();
    this.typingUnsub && this.typingUnsub();
    this.ackUnsub && this.ackUnsub();
    Object.values(this._typingTimers || {}).forEach((t) => clearTimeout(t));
  },
  methods: {
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0] || null;
      console.log("Selected file:", this.selectedFile?.name);
    },
    async loadHistory() {
      try {
        const q = `?company_id=${this.hotelId}&booking_room_id=${this.bookingRoomId}&limit=50`;
        const rows =
          (await this.$axios.get(`/chat_messages_history${q}`)) || [];
        this.messages = (rows.data || []).sort(
          (a, b) => (a.tsDb || 0) - (b.tsDb || 0)
        );
        this.$nextTick(this.scrollToEnd);
      } catch (_) {}
    },
    upsertMessage(msg) {
      const i = this.messages.findIndex((x) => x.id === msg.id);
      if (i === -1) this.messages.push(msg);
      else this.$set(this.messages, i, { ...this.messages[i], ...msg });

      // keep ordered; then force a tick
      this.messages.sort((a, b) => (a.tsDb || 0) - (b.tsDb || 0));
      this.$nextTick(() => this.$forceUpdate()); // ✅ nudge the view
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
      const date = new Date(ts);
      const now = new Date();

      // Check if same day
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      if (isToday) {
        // Only show time
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        // Show date + time
        return (
          date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric", // valid values: "numeric" or "2-digit"
          }) +
          " " +
          date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      }
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
    async sendTyping() {
      this.$mqtt.pub(this.typingTopic, {
        user: this.me,
        typing: true,
        ts: this.getSecondsInTimezone(this.timezone),
        tsDb: Date.now(),
      });
      clearTimeout(this._t);
      this._t = setTimeout(() => {
        this.$mqtt.pub(this.typingTopic, {
          user: this.me,
          typing: false,
          ts: this.getSecondsInTimezone(this.timezone),
          tsDb: Date.now(),
        });
      }, 1200);
    },
    async send() {
      if (this.selectedFile) {
        await this.sendFile();
      }

      const text = this.draft.trim();
      if (!text) return;

      let m = {
        id: Date.now() + "_" + Math.random().toString(36).slice(2),
        sender: this.me,
        role: "guest",
        type: "text",
        text,
        ts: this.getSecondsInTimezone(this.timezone),
        tsDb: Date.now(),
        booking_id: this.bookingId,
        booking_room_id: this.bookingRoomId,
        room_id: this.roomId,
        room_number: this.roomNumber,
        company_id: this.hotelId,
      };

      const payload = JSON.parse(JSON.stringify(m));
      this.$mqtt.pub(this.msgTopic, payload); // ✅ publish a plain object
      //this.$mqtt.pub(this.msgTopic, m);
      this.upsertMessage(m);
      this.draft = "";
      this.$nextTick(this.scrollToEnd);
      this.ack(m.id);

      await this.sendTyping();
      this.$nextTick(this.scrollToEnd);

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
    async sendFile() {
      if (!this.selectedFile) {
        //alert("Please select a file first");
        return;
      }

      const file = this.selectedFile;
      // const file = e.target.files && e.target.files[0];

      // console.log(file);

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

        const url = res && res.data.message.url;
        const id = res.data.message.id;

        if (url == "null") {
          alert("File Upload Failed");

          return false;
        }

        const m = {
          id: id, //Date.now() + "_" + Math.random().toString(36).slice(2),
          sender: this.me,
          role: "guest",
          type: "file",

          url: url,
          filename: "image",
          ts: this.getSecondsInTimezone(this.timezone),
          tsDb: Date.now(),
          booking_id: this.bookingId,
          booking_room_id: this.bookingRoomId,
          room_id: this.roomId,
          room_number: this.roomNumber,
          company_id: this.hotelId,
        };
        const payload = JSON.parse(JSON.stringify(m));
        this.$mqtt.pub(this.msgTopic, payload); // ✅ publish a plain object
        // this.$mqtt.pub(this.msgTopic, m);
        this.upsertMessage(m);
        this.$nextTick(this.scrollToEnd);
        this.ack(m.id);
        await this.sendTyping();
        this.$nextTick(this.scrollToEnd);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        // e.target.value = "";
        this.$refs.fileInput.value = ""; // reset input
      }

      this.selectedFile = null; // reset after upload
      this.$refs.fileInput.value = ""; // reset input

      console.log("selectedFile", this.selectedFile);
    },
    viewImage(messageId, url) {
      this.previewImageId = messageId;
      let $url = process.env.BACKEND_URL;
      this.previewImageUrl = url;

      this.DialogpreviewImage = true;
    },
    downloadImage() {
      let $url = process.env.BACKEND_URL;
      window.open(
        `${$url}chat_download_image?id=${this.previewImageId}`,
        "_blank"
      );
    },
    getSecondsInTimezone(timeZone) {
      // Current UTC timestamp (ms)
      const now = new Date();

      // Format the time in the target timezone
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      // Extract date/time parts
      const parts = {};
      formatter.formatToParts(now).forEach(({ type, value }) => {
        parts[type] = value;
      });

      // Build a date string as if it's local time in that timezone
      const localTimeString = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;

      console.log(localTimeString);

      // Parse that string as if it's UTC (to get correct epoch seconds for that timezone clock time)
      return Math.floor(new Date(localTimeString).getTime());
    },
    ack(id) {
      this.$mqtt.pub(this.ackTopic, {
        user: this.me,
        lastSeenId: id,
        ts: this.getSecondsInTimezone(this.timezone),
        tsDb: Date.now(),
      });
    },

    async startRec() {
      // Pick best supported mime for the browser
      const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4", // iOS Safari will end up giving m4a
      ];
      let mimeType = "";
      for (const c of candidates) {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) {
          mimeType = c;
          break;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : {}
      );
      this.chunks = [];
      this.mediaRecorder.ondataavailable = (e) =>
        e.data.size && this.chunks.push(e.data);
      this.mediaRecorder.start();
      this.recording = true;
      this.startTs = Date.now();
      this.seconds = 0;
      this.tmr = setInterval(
        () => (this.seconds = Math.round((Date.now() - this.startTs) / 1000)),
        200
      );
    },

    async stopRec() {
      if (!this.mediaRecorder) return;
      await new Promise((res) => {
        this.mediaRecorder.onstop = res;
        this.mediaRecorder.stop();
      });
      clearInterval(this.tmr);
      // Stop all mic tracks so the browser icon goes away
      if (this.mediaRecorder.stream) {
        this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      this.recording = false;

      const blob = new Blob(this.chunks, {
        type: this.mediaRecorder.mimeType || "audio/webm",
      });
      const durationMs = Date.now() - this.startTs;

      // 1) Upload via HTTP
      const form = new FormData();
      // form.append("file", file);
      form.append("sender", this.me);
      form.append("role", "guest");
      form.append("type", "audio");
      form.append("ts", Date.now());

      form.append("booking_id", this.bookingId);
      form.append("booking_room_id", this.bookingRoomId);
      form.append("room_id", this.roomId);
      form.append("room_number", this.roomNumber);
      form.append("company_id", this.hotelId);
      form.append("durationMs", durationMs.toString());
      form.append(
        "file",
        blob,
        `voice_${this.bookingRoomId}.${this.fileExt(blob.type)}`
      );

      const res = await this.$axios.post("chat_messages_upload_file", form);
      // data => { url, mime, size, durationMs }
      const url = res && res.data.message.url;
      const id = res.data.message.id;

      if (url == "null") {
        alert("File Upload Failed");

        return false;
      }
      const m = {
        id: id, //Date.now() + "_" + Math.random().toString(36).slice(2),
        sender: this.me,
        role: "guest",
        type: "audio",

        url: url,
        filename: "image",
        ts: this.getSecondsInTimezone(this.timezone),
        tsDb: Date.now(),
        booking_id: this.bookingId,
        booking_room_id: this.bookingRoomId,
        room_id: this.roomId,
        room_number: this.roomNumber,
        company_id: this.hotelId,
        audio: url,
      };
      const payload = JSON.parse(JSON.stringify(m));
      this.$mqtt.pub(this.msgTopic, payload); // ✅ publish a plain object
      // this.$mqtt.pub(this.msgTopic, m);
      this.upsertMessage(m);
      this.$nextTick(this.scrollToEnd);
      this.ack(m.id);
      await this.sendTyping();
      this.$nextTick(this.scrollToEnd);
    },

    fileExt(mime) {
      if (
        mime.includes("mp4") ||
        mime.includes("x-m4a") ||
        mime.includes("aac")
      )
        return "m4a";
      if (mime.includes("webm")) return "webm";
      if (mime.includes("ogg")) return "ogg";
      return "dat";
    },
  },
};
</script>
