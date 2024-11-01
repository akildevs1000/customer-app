<template>
  <v-card
    elevation="0"
    height="70"
    class="text-center pt-1"
    :style="`background-color:${bgColor}; color:${color}; border-radius: 12px`"
    @click="$emit(`custom-index`, index)"
  >
    <small class="px-1" style="font-size: 9px">{{ label }}</small>
    <div class="pa-1 mt-1" style="font-size: 14px">
      {{ value }} <span v-if="sub_value">/</span>
      <small v-if="sub_value" style="font-size: 9px">{{ sub_value }}</small>
    </div>
  </v-card>
</template>

<script>
export default {
  props: ["label", "value", "sub_value", "color", "bgColor", "index"],
};
</script>
