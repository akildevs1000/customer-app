<template>
  <span>
    <div
      v-for="(item, index) in items"
      :key="index"
      class="text-center ma-2"
      style="
        border-radius: 12px;
        display: inline-block;
        min-width: 54px !important;
      "
    >
      <v-card
        rounded
        elevation="0"
        dark
        class="pa-2"
        :style="getRelatedStyle(item)"
        @click="$emit(`selectedRoom`, item)"
      >
        <span>{{
          item.room_no.length < 5
            ? item.room_no
            : item.room_no.slice(0, 5) + "..."
        }}</span>
      </v-card>
    </div>
  </span>
</template>

<script>
export default {
  props: ["items", "bgColor", "color"],
  methods: {
    getRelatedStyle(item) {
      if (item.is_cleaned) {
        return `background-color:#2ce860;color:white;`;
      }
      return `background-color:${this.bgColor};color:${this.color};`;
    },
  },
};
</script>
