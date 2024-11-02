<template>
  <v-container fluid class="mt-10">
   <span v-for="n in 5" :key="n">
    <v-card
      elevation="2"
      cols="12"
      v-for="(item, index) in data"
      :key="index"
      class="mb-2 mx-2"
    >
      <v-card-text class="px-3 py-0">
        <v-row dense no-gutters>
          <v-col cols="6">
            <small>Item</small>
          </v-col>
          <v-col cols="6" class="text-right">
            <small>{{ item.item }}</small>
          </v-col>
          <v-col cols="6">
            <small>Bill No</small>
          </v-col>
          <v-col cols="6" class="text-right">
            <small>{{ item.bill_no }}</small>
          </v-col>
          <v-col cols="6">
            <small>Qty</small>
          </v-col>
          <v-col cols="6" class="text-right">
            <small> {{ item.qty }}</small>
          </v-col>
          <v-col cols="6">
            <small>Amount</small>
          </v-col>
          <v-col cols="6" class="text-right">
            <small class="text-body-2 blue--text">{{ item.amount }}</small>
          </v-col>
          <v-col cols="6">
            <small>Date</small>
          </v-col>
          <v-col cols="6" class="text-right">
            <small>{{ item.posting_date }}</small>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
   </span>
    <!-- <AssetsTable height="500" :headers="headers" :items="data">
        </AssetsTable> -->
    <!-- <table cellspacing="0" style="width: 100%">
      <thead>
        <tr>
          <td
            v-for="(col, index) in headers"
            :key="index"
            class="primary--text py-1 px-2 border-top border-bottom"
            :class="`text-${col.align || 'left'}`"
          >
            {{ col.text }}
          </td>
        </tr>
      </thead>
      <tbody v-for="n in 5" :key="n">
        <tr v-for="(item, index) in data" :key="index">
          <td
            v-for="(header, tdIndex) in headers"
            :key="tdIndex"
            :class="`text-${header.align}`"
            class="py-1 px-2 border-bottom text-color"
            :width="header.width"
          >
            <small>
              <slot :name="header.value" :item="item">{{
                item[header.value]
              }}</slot></small
            >
          </td>
        </tr>
        <slot name="row"></slot>
      </tbody>
    </table> -->
  </v-container>
</template>

<script>
export default {
  layout: "qrcode",
  auth: false,
  data: () => ({
    Model: "House Keeping",
    filters: {},
    options: {},
    loading: false,
    response: "",
    data: [],
    cards: [],
    bigCards: [],
    errors: [],
    headers: [
      { text: `#`, value: `serial`, align: `center` },
      { text: `Item`, value: `item`, align: `center` },
      { text: `Qty`, value: `qty`, align: `center` },
      { text: `Amount`, value: `amount`, align: `center` },
      { text: `Date`, value: `posting_date`, align: `center` },
    ],
    componentKey: 1,
  }),

  async created() {
    this.getDataFromApi();
  },
  mounted() {},
  watch: {
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
  },
  methods: {
    async getDataFromApi() {
      let config = {
        params: {
          booking_id: 4,
          room_id: 92,
        },
      };
      this.loading = true;
      let { data } = await this.$axios.get(
        `get-posting-by-booking-id-and-room-id`,
        config
      );
      this.loading = false;

      // postings list. customer posting while staying in hotel room
      this.data = data.map((e, i) => ({
        serial: i + 1,
        bill_no: e.bill_no,
        item: e.item,
        qty: e.qty,
        amount: this.$utils.currency_format(e.amount_with_tax),
        posting_date: this.$dateFormat.dmy(e.posting_date),
      }));
    },
  },
};
</script>
