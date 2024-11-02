<template>
  <v-container
    fluid
    class="mt-5"
    style="
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 90vh;
      padding: 0;
    "
  >
    <!-- Chat Messages Container -->
    <v-card
      style="flex: 1; overflow-y: auto; padding: 16px; min-height: 50vh"
      elevation="0"
    >
      <v-container
        v-if="messages.length === 0"
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: inherit;
        "
      >
        <p class="text-center">No messages yet</p>
      </v-container>

      <v-container v-else style="display: flex; flex-direction: column">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="text-color"
        >
          <div
            v-if="message.sender_id == sender_id"
            style="display: flex; justify-content: flex-end"
            class="pb-1"
          >
            <div
              style="
                font-size: 13px;
                display: inline-block;
                line-height: 1.1;
                margin-right: 10px;
                margin-top: 15px;
              "
              class="text-right"
            >
              <div>
                <v-avatar
                  class="mr-1 my-2"
                  v-for="(chat_photo, index) in message.chat_photos"
                  :key="index"
                  style="
                    border: 5px solid #eaeaea;
                    border-radius: 5px !important;
                  "
                  tile
                  size="50"
                >
                  <ThumbnailImageView
                    :key="chat_photo.photo_path"
                    :src="chat_photo.photo_path"
                  />
                </v-avatar>
              </div>
              <div
                :class="` ${
                  message && message.chat_photos.length > 0 ? 'pr-2' : ''
                }`"
              >
                {{ message.message }}
              </div>
              <small
                :class="` ${
                  message && message.chat_photos.length > 0 ? 'pr-2' : ''
                }`"
              >
                {{ $dateFormat.hm(message.created_at) }}</small
              >
            </div>

            <v-avatar
              :class="`purple lighten-1 ${
                message && message.chat_photos.length > 0 ? 'mt-5' : 'mt-2'
              }`"
              size="40"
            >
              <v-icon color="white" style="align-self: flex-start"
                >mdi-account</v-icon
              >
            </v-avatar>
          </div>

          <div style="display: flex" v-else class="pb-1">
            <v-avatar class="grey lighten-1" size="40">
              <v-icon color="white">mdi-account</v-icon>
            </v-avatar>
            <div
              style="
                font-size: 13px;
                display: inline-block;
                line-height: 1.1;
                margin-left: 10px;
              "
              class="mt-3"
            >
              <div>
                <v-avatar
                  v-for="(chat_photo, index) in message.chat_photos"
                  :key="index"
                  style="
                    border: 1px solid purple;
                    border-radius: 10px !important;
                  "
                  tile
                  size="50"
                >
                  <ThumbnailImageView
                    :key="chat_photo.photo_path"
                    :src="chat_photo.photo_path"
                  />
                </v-avatar>
              </div>
              <div>{{ message.message }}</div>
              <small>{{ $dateFormat.hm(message.created_at) }}</small>
            </div>
          </div>
        </div>
        <!-- <v-row>
          <v-col
            v-for="(message, index) in messages"
            :key="index"
            cols="12"
            class="message"
            >{{ message }}</v-col
          >
        </v-row> -->
      </v-container>
    </v-card>

    <!-- Input Field at Bottom -->
    <div style="position: sticky; bottom: 60px; background: white">
      <div v-if="previewImages.length" class="mb-1"
      >
        <v-row no-gutters>
          <v-col
            cols="2"
            v-for="(previewImage, index) in previewImages"
            :key="index"
          >
            <div style="position: relative">
              <v-icon
                class="my-icon"
                style="position: absolute; z-index: 1; left: 30px; top: -6px"
                right
                color="red"
                small
                @click="removePreviewImage(index)"
              >
                mdi-close
              </v-icon>

              <v-avatar
                style="border: 1px solid purple; border-radius: 10px !important"
                tile
                size="50"
              >
                <v-img :src="previewImage"></v-img>
              </v-avatar>
            </div>
          </v-col>
        </v-row>
      </div>
      
      <div style="display: flex">
        <div style="width: 100%">
          <v-text-field
            @paste="handlePaste"
            outlined
            dense
            hide-details
            v-model="newMessage"
            label="Type your message..."
            @keyup.enter="sendMessage"
            style="width: 100%"
          >
            <template v-slot:append>
              <UploadMultiplePhotos
                @files-selected="handleMultipleFileSelection($event)"
              /> </template
          ></v-text-field>
        </div>
        <div class="ml-2">
          <v-icon
            color="primary"
            @click="sendMessage"
            style="cursor: pointer; flex-grow: 1; margin-top: 8px"
          >
            mdi-send
          </v-icon>
        </div>
      </div>
    </div>
  </v-container>
</template>
<script>
import Pusher from "pusher-js";

export default {
  layout: "qrcode",
  auth: false,
  data: () => ({
    id: "",
    pageValid: false,
    newMessage: "",
    messages: [],
    sender_id: 0,
    receiver_id: 4,
    company_id: 0,
    previewImages: [],
    attachments: [],
    oldCount: 0,
    intervalId: null,
  }),
  async mounted() {
    console.log("🚀 ~ created ~ created:");
    await this.getMessages();
    this.scrollToBottom();
    this.previewImages = [];
    await this.checkForNewMessageCount();
  },
  async created() {
    await this.setValues();
  },
  beforeDestroy() {
    this.clearMessageCountInterval();
  },
  methods: {
    clearMessageCountInterval() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null; // Reset the intervalId
      }
    },
    async setValues() {
      this.sender_id = this.$localStorage.get("customer_id") || 0;
      console.log("🚀 ~ created ~ this.sender_id:", this.sender_id);
      this.company_id = this.$localStorage.get("hotelQrcodeCompanyId") || 0;
      console.log("🚀 ~ created ~ this.company_id:", this.company_id);
      this.oldCount = this.$localStorage.get(
        "old-message-count-by-customer-id"
      );
      console.log("🚀 ~ created ~ this.oldCount:", this.oldCount);
    },
    async checkForNewMessageCount() {
      this.intervalId = setInterval(async () => {
        let { data } = await this.$axios.get(
          `latest-message-count-customer-id/${this.sender_id}`
        );

        let oldCount = this.oldCount;

        if (data != oldCount) {
          oldCount = data;
          console.log("🚀 ~ setInterval ~ data, oldCount:", data, oldCount);

          await this.getMessages();
        }
      }, 5000);

      // Pusher.logToConsole = true;
      // const pusher = new Pusher("push_access_key", {
      //   cluster: "ap2",
      // });

      // // Subscribe to the channel and bind to the event
      // const channel = pusher.subscribe(
      //   "customer-channel" + localStorage.getItem("customer_id") || '0' // get customer_id value from localstorage
      // );
      // channel.bind("my-event", async (data) => {
      //   await this.getMessages();
      //   this.scrollToBottom(); // Scroll to the bottom after fetching messages
      // });
    },

    handleMultipleFileSelection(e) {
      this.previewImages = e;
    },
    removePreviewImage(index) {
      this.previewImages.splice(index, 1);
    },
    async getMessages() {
      let payload = {
        params: {
          sender_id: this.sender_id,
          receiver_id: this.receiver_id,
          company_id: this.company_id,
        },
      };
      let { data } = await this.$axios.get(`chat`, payload);
      this.messages = data;
    },

    scrollToBottom() {
      // Scroll to the bottom of the chat messages container
      // const chatContainer = this.$refs.chatMessages;
      // chatContainer.scrollTop = chatContainer.scrollHeight;
    },
    async sendMessage() {
      try {
        let payload = {
          message: this.newMessage,
          sender_id: this.sender_id,
          receiver_id: this.receiver_id,
          chat_photos: this.previewImages,
          company_id: this.company_id,
        };

        await this.$axios.post(`chat`, payload);
        await this.getMessages();
        this.newMessage = "";
        this.previewImages = [];
      } catch (error) {
        console.log(error);
      }
    },
    handlePaste(event) {
      if (this.previewImages.length >= 3) {
        alert(`Only 3 photos allowed`);
        return;
      }
      const items = (event.clipboardData || window.clipboardData).items;
      for (let index in items) {
        const item = items[index];
        if (item.kind === "file") {
          const file = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (e) => {
            this.previewImages.push(e.target.result); // Add the preview image to the array
          };
          reader.readAsDataURL(file);
        }
      }
      // Prevent the default paste action
      event.preventDefault();
    },
  },
};
</script>
