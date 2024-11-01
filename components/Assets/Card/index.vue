<template>
  <v-row class="pt-5">
    <v-col cols="1" class="tex-center">
      <v-icon small class="mx-1" :color="options.color">{{ options.icon }}</v-icon>
    </v-col>
    <v-col class="text-right">
      <small class="px-2" :class="`${options.color}--text`">
        {{ options.value }}
      </small>
    </v-col>
  </v-row>
</template>
<script>
export default {
  props: ["options"],
};
</script>
