<template>
  <div class="pl-2">
    <div class="mb-2">Next 7 Days Forecast</div>
    <div style="display: flex; justify-content: left; gap: 18px; height: 90px">
      <div v-for="(item, index) in forecastData" :key="index">
        <div
          :title="item.availableCount"
          style="
            width: 10px;
            height: 90px;
            background: #d8d8d8;
            position: relative;
            border-radius: 50px;
          "
        >
          <div
            :title="item.bookedCount"
            :style="`position: absolute;
                  bottom: 0;
                  width: 100%;
                  height: ${item.bookedPercent}%;
                  background: #71de36;
                  border-radius: 50px;
                  transition: height 0.5s ease;`"
          ></div>

          <div
            class="text-color"
            style="
              position: absolute;
              bottom: -22px;
              left: 2px;
            "
          >
          <small>{{ getFirstLetter(item.label) }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    forecastData: [],
  }),
  async created() {
    let { data } = await this.$axios.get(
      `ten-days-forcast/${this.$auth.user.company_id}`
    );
    if (data.length > 0) {
      this.forecastData = data.slice(0, 7);
    }
  },
  methods: {
    getFirstLetter(label) {
      if (!label || typeof label !== "string") {
        return ""; // Handle cases where label is not a valid string
      }
      return label.charAt(0).toUpperCase(); // Get the first character and convert it to uppercase
    },
    getLabelStyle(label) {
      const leftPosition = label === "Fri" || label === "Thu" ? "20%" : "60%";
      return `
        left: -${leftPosition};
      `;
    },
  },
};
</script>
