<template>
  <v-dialog persistent v-model="dialog" width="350">
    <AssetsIconClose left="334" @click="dialog = false" />
    <template v-slot:activator="{ on, attrs }">
      <v-img v-bind="attrs" v-on="on" :src="src"></v-img>
    </template>
    <v-card>
      <v-container>
        <img style="width: 100%" v-if="src" :src="src" alt="Front Image" />
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["src"],
  data: () => ({
    dialog: false,
  }),
};
</script>
