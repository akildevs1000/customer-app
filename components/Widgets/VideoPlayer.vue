<template>
  <v-dialog v-model="dialog" width="340" persistent>
      <AssetsIconClose left="330" @click="closeDialog" />
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          large
          fab
          color="primary"
          class=""
          style="animation: pulse 1s infinite"
        >
          <v-icon color="white" large>mdi-play</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="headline">{{ title }}</v-card-title>
        <v-card-text class="text-center">
            <iframe
            v-if="dialog"
            :src="videoUrl"
            width="100%"
            height="400"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
export default {
  props: ["src", "title"],
  data() {
    return {
      dialog: false, // Control for dialog visibility
    };
  },
  computed: {
    videoUrl() {
      return `https://www.youtube.com/embed/cNC9D1L3KV0?autoplay=1&origin=${window.location.origin}`;
    }
  },
  methods: {
    closeDialog() {
      this.dialog = false;
    },
  },
};
</script>
