<template>
  <span>
    <input
      type="file"
      :ref="`fileInput`"
      style="display: none"
      @change="handleFileInputChange"
    />
    <v-icon color="red" v-if="isFileSelect" @click="clearImage"
      >mdi-close</v-icon
    >
    <span v-if="isFileSelect">
      <component
        :label="`${name} ${imageSize}`"
        :key="newDialogKey"
        icon="mdi-eye-outline"
        :is="currentComponent"
        :src="preview"
      />
    </span>
    <v-icon v-else @click="triggerFileInput" :color="color"
      >mdi-camera-outline</v-icon
    >
  </span>
</template>

<script>
export default {
  props: {
    label: {
      default: "Upload your attachment",
      type: String,
    },
    name: {
      default: "Photo",
      type: String,
    },
    color: {
      default: "purple",
      type: String,
    },
    validationMessage: {
      default: "Item not found",
      type: String,
    },
    rule: {
      default: true,
    },
  },
  data: () => ({
    isFileSelect: false,
    preview: null,
    currentComponent: null,
    viewFileSrc: "",
    newDialogKey: 1,
    imageSize: null,
  }),
  methods: {
    clearImage() {
      this.preview = null;
      this.isFileSelect = false;
      this.$refs[`fileInput`].value = "";
    },
    triggerFileInput() {
      if (!this.rule) {
        alert(this.validationMessage);
        return;
      }

      this.$refs[`fileInput`].click();
    },

    handleFileInputChange(event) {
      const file = event.target.files[0];

      console.log(file);

      if (file) {
        this.isFileSelect = true;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
              (blob) => {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg", // Change to the desired image type if needed
                  lastModified: Date.now(),
                });

                const compressedReader = new FileReader();
                compressedReader.readAsDataURL(compressedFile);
                compressedReader.onload = (compressedEvent) => {
                  const compressedDataUrl = compressedEvent.target.result;

                  // Update the preview and emit events
                  this.preview = compressedDataUrl;

                  // Get the new file size in KB
                  const fileSizeInKB = (compressedFile.size / 1024).toFixed(2);
                  this.imageSize = `(${fileSizeInKB} KB)`;

                  this.$emit("file-preview", compressedDataUrl);
                  this.$emit("file-selected", compressedDataUrl);

                  ++this.newDialogKey;
                  this.currentComponent = "WidgetsViewTempFile"; // Set the component name to render
                };
              },
              "image/jpeg",
              0.3
            ); // Adjust the image quality (0.7 is a good balance)
          };
        };
      } else {
        this.isFileSelect = false;
      }
    },
  },
};
</script>
