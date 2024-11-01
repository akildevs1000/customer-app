<template>
  <v-row v-if="labels.length" class="">
    <v-col v-if="!hideTable" cols="6" class="text-center">
      <div class="text-color">
        <v-container>
          <table style="width: 100%">
            <tr v-for="(item, index) in labels" :key="index">
              <td class="text-left" style="color: #8a8a8a">
                {{ item.text
                }}<v-icon :color="colors[index]">mdi mdi-square-medium</v-icon>
              </td>
            </tr>
          </table>
        </v-container>
      </div>
    </v-col>
    <v-col cols="6" class="text-center">
      <div v-if="chartOptions.customTotalValue == 0" class="empty-doughnut1">
        0
      </div>
      <div v-else class="text-right" style="width: 120px">
        <apexchart
          :key="key"
          style="margin: 0 auto; text-align: left"
          width="100%"
          :class="isCentered ? 'mx-auto' : ''"
          type="donut"
          legend="false"
          :options="chartOptions"
          :series="series"
        ></apexchart>
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: [
    "compId",
    "labels",
    "colors",
    "size",
    "total",
    "width",
    "showPriceFormat",
    "hideTable",
    "isCentered",
  ],

  data: () => ({
    key: 1,
    series: [],
    chartOptions: {
      legend: false,
      colors: [],
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: false,
                fontSize: "22px",
                fontFamily: "Source Sans Pro , sans-serif !important",
                color: "#dfsda",
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "12px",
                fontFamily: "Source Sans Pro , sans-serif !important",
                // fontWeight: "bold", // Make the total value bold
                color: "#8a8a8a",
                formatter: function (val) {
                  return val;
                },
              },
              total: {
                show: true,
                fontFamily: "Source Sans Pro , sans-serif !important",
                label: "Total",
                color: "#373d3f",
                formatter: function (val) {
                  return val.config.customTotalValue;
                  // console.log(showPriceFormat);
                  // if (showPriceFormat) {
                  //   return getPriceFormat(val.config.customTotalValue);
                  // } else return val.config.customTotalValue;
                },
              },
            },
          },
        },
      },
    },
  }),

  mounted() {
    // this.series = this.labels.map((e) =>
    //   e.value == 0 ? 10 : parseInt(e.value)
    // );
    // setTimeout(() => {
    //try {
    let counter = 0;
    this.chartOptions.labels = [];
    this.chartOptions.series = [];
    this.labels.forEach((element) => {
      if (element.text == "Profit") console.log(element.value);
      this.chartOptions.labels[counter] = element.text;
      this.chartOptions.series[counter] = Math.abs(element.value); //
      this.chartOptions.colors[counter] = this.colors[counter];
      this.series[counter] = Math.abs(element.value); // (element.value + "").replace("-", "");
      counter++;
    });

    this.chartOptions.customTotalValue = this.total;

    // } catch (e) {}
    this.key += 1;

    // console.log(this.series);
    //}, 1000 * 1);
  },
  methods: {
    getPriceFormat(price) {
      let currency = this.$auth.user.company.currency ?? "";
      return (
        currency +
        "" +
        parseFloat(price).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })
      );
    },
  },
};
</script>
