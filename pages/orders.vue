<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <AssetsTable height="500" :headers="headers" :items="data">
        </AssetsTable>
      </v-col>
    </v-row>
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
      { text: `#`, value: `serial`, align: `left` },
      { text: `Item`, value: `item`, align: `left` },
      { text: `Qty`, value: `qty`, align: `left` },
      { text: `Amount`, value: `amount`, align: `left` },
      { text: `Date`, value: `posting_date`, align: `left` },
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
