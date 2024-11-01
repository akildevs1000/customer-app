<template>
  <v-dialog v-model="dialog" height="300" width="300">
    <AssetsIconClose left="290" @click="dialog = false" />
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on"
        ><v-icon color="purple">mdi-camera-outline</v-icon></span
      >
    </template>

    <v-card v-if="item && item.id">
      <v-alert class="grey lighten-3" dense flat>
        <span>Upload After Attachment</span>
      </v-alert>

      <v-card-text>
        <v-row>
          <v-col class="text-center">
            <v-card outlined class="pa-15">
              <span class="primary--text">
                <WidgetsUploadAttachment
                  validationMessage="Room not found"
                  :rule="item"
                  :displayPreview="false"
                  :label="fileName"
                  :name="fileName"
                  @file-selected="handleFileSelection"
                />
              </span>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="text-center">
            <AssetsButton
              @click="dialog = false"
              :options="{
                label: `Cancel`,
                icon: ``,
                color: `red`,
              }"
            />
            <AssetsButton
              @click="update"
              :options="{
                label: `Submit`,
                icon: ``,
                color: `green`,
              }"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  data: () => ({
    dialog: false,
    payload: null,
  }),
  computed: {
    fileName() {
      return `${this.item?.room}_${Date.now()}.png`;
    },
  },
  methods: {
    handleFileSelection(e) {
      this.payload = e;
    },
    async update() {
      try {
        await this.$axios.post(`upload-after-attachment`, {
          id: this.item.id,
          attachment_name: this.fileName,
          attachment: this.payload,
        });
        alert(`Attachment Uploaded`);
        this.$emit(`response`);
        this.dialog = false;
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>
