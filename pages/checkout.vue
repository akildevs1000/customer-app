<template>
  <div v-if="pageValid == 'true'">
    <div class="text-center ma-10">
      <v-snackbar v-model="snackbar" top="top" color="secondary" elevation="24">
        {{ snackbarMessage }}
      </v-snackbar>
    </div>
    <v-card>
      <div style="text-align: center" v-if="loading">
        <img src="/loading.gif" width="200px" />
      </div>
      <v-card-title
        style="padding: 4px; font-size: 14px; background-color: #b3b3b3"
        dense
      >
        <span>Orders List </span>

        <v-spacer></v-spacer>
        Total Price {{ cartGrandTotalAmount }}
      </v-card-title>
      <v-card-text class="pa-0 pt-2" style="font-size: 12px">
        <v-expansion-panels inset>
          <v-expansion-panel
            v-for="(items, datetime) in cartItems"
            :key="datetime"
            v-model="panels"
          >
            <v-expansion-panel-header
              >{{ datetime }} -
              <v-spacer
                >Total Items ({{ items.length }})</v-spacer
              ></v-expansion-panel-header
            >
            <v-expansion-panel-content style="width: 100%">
              <v-row :key="index2" v-for="(item, index2) in items" class="pt-2">
                <v-col cols="1" style="padding-right: 0px">
                  {{ index2 + 1 }}
                </v-col>
                <v-col class="text-center">
                  <!-- <img
                    class="p-5 boxshadow"
                    :src="item.food.item_picture"
                    width="50px"
                    style="
                      border: 1px solid #ddd;
                      max-width: 100%;
                      height: 40px;
                      border-radius: 10px;
                      object-fit: cover;
                      cursor: pointer;
                    "
                  /> -->
                  <div>{{ item.item }}</div>
                </v-col>
                <v-col cols="4" class="pl-0 pr-0" flex>
                  <div style="font-size: 12px">
                    {{ item.qty }}
                    <v-icon color="green">mdi-alpha-x-box</v-icon>
                    {{ item.single_amt }}

                    {{ item.tax }}

                    <v-icon color="green">mdi-chevron-right</v-icon>
                    {{ item.amount_with_tax.toFixed(2) }}
                  </div>
                </v-col>
                <v-col cols="3" class="flex">
                  <div v-if="item.status == 0">--</div>
                  <div v-else-if="item.status == 1" style="color: #93ab6d">
                    Preparing
                  </div>
                  <div v-else-if="item.status == 2" style="color: green">
                    Served
                  </div>
                  <div v-else-if="item.status == 3" style="color: red">
                    Cancelled
                  </div>
                </v-col>
                <v-col cols="1">
                  <v-icon
                    @click="cancelItem(item)"
                    title="Click to Cancel the Item"
                    v-if="item.status == 0"
                    color="red"
                    >mdi mdi-close-circle</v-icon
                  >
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- <v-row>
          <v-col cols="4" style="color: red; font-size: 12px"> </v-col>
          <v-col cols="4" style="font-weight: bold; text-align: center"
            >Total :</v-col
          >
          <v-col cols="4" style="font-weight: bold; text-align: center">
            {{ cartTotalAmount.toFixed(2) }}
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="4" style="color: red; font-size: 12px"> </v-col>
          <v-col cols="4" style="font-weight: normal; text-align: center"
            >GST :</v-col
          >
          <v-col cols="4" style="font-weight: normal; text-align: center">
            + {{ cartGSTAmount.toFixed(2) }}
          </v-col>
        </v-row>
        <v-row style="font-size: 18px">
          <v-col cols="4" style="color: red; font-size: 12px"> </v-col>
          <v-col cols="4" style="font-weight: bold; text-align: center"
            >Grand Total :</v-col
          >
          <v-col cols="4" style="font-weight: bold; text-align: center">
            <v-chip color="green" label outlined>{{
              cartGrandTotalAmount.toFixed(2)
            }}</v-chip>
          </v-col>
        </v-row> -->
        <!-- <v-card-actions class="mt-5 text-center">
           <v-btn @click="cartItemDialog = false" dark filled color="red"
              >Close</v-btn
            >
        <v-spacer></v-spacer>
          <p></p
        ></v-card-actions> -->
      </v-card-text>
    </v-card>
  </div>
  <div v-else style="padding: 25%">UnAuthorised Access</div>
</template>

<script>
export default {
  layout: "qrcode",
  data: () => ({
    cartTotalAmount: 0,
    cartGSTAmount: 0,
    cartGrandTotalAmount: 0,
    id: "",
    cartSelectDropdown: [],
    data: [],
    cart_total_items: 0,
    cartItems: [],
    snackbar: false,
    snackbarMessage: "",
    food_tax: 1,
    company_id: "",
    room_id: "",
    booking_id: "",
    room_number: "",
    loading: false,
    pageValid: false,
    panels: [],
  }),
  auth: false,
  mounted() {
    if (localStorage) {
      this.company_id = localStorage.getItem("hotelQrcodeCompanyId");
      this.room_id = localStorage.getItem("hotelQrcodeRoomId");
      this.booking_id = localStorage.getItem("hotelQrcodeBookingId");
      this.room_number = localStorage.getItem("hotelQrcodeRoomNumber");
      this.pageValid = localStorage.getItem("hotelQRCodeOTPverified");

      this.getOrderedList();
    } else {
    }
  },
  watch: {},
  created() {
    // this.displyCartItems();
    try {
      if (localStorage) {
        this.pageValid = localStorage.getItem("hotelQRCodeOTPverified");
      }
    } catch (e) {}

    setInterval(() => {
      this.getOrderedList();
    }, 1000 * 60);
  },
  methods: {
    isPageValid() {
      return this.pageValid;
    },
    getOrderedList() {
      let options = {
        params: {
          company_id: this.company_id,
          booking_id: this.booking_id,
          room_id: this.room_id,
        },
      };
      this.loading = true;
      this.$axios
        .get(`get-posting-by-booking-id-and-room-id`, options)
        .then(({ data }) => {
          this.cartItems = data;
          this.calculateTotal();

          this.loading = false;
        });
    },
    calculateTotal(item = null) {
      this.totals = {};
      this.cartGrandTotalAmount = 0; // reset before loop
      let panelCount = 0;
      for (let datetime in this.cartItems) {
        this.panels.push(panelCount++);
        const items = this.cartItems[datetime];
        let groupTotal = 0;

        for (let i = 0; i < items.length; i++) {
          const order = items[i];
          groupTotal += order.food_price * order.qty;
        }

        // store total per datetime
        this.$set(this.totals, datetime, groupTotal.toFixed(2));

        // add to grand total
        this.cartGrandTotalAmount += groupTotal;
      }

      // round final total
      this.cartGrandTotalAmount = this.cartGrandTotalAmount.toFixed(2);
    },

    cancelItem(item) {
      if (
        confirm(
          "Are you sure you want to cancel Order Item " + item.food.name + "?"
        )
      ) {
        let options = {
          params: {
            company_id: item.company_id,
            item_id: item.id,

            booking_id: item.booking_id,
            room_id: item.room_id,
          },
        };
        this.$axios
          .post(`hotel_orders_cancel_food_item`, options.params)
          .then(({ data }) => {
            this.snackbar = true;
            this.snackbarMessage = data.message;
            if (!data.status) {
            } else {
              this.getOrderedList();
            }
          });
      }
    },
    //-------------------------------------------
    async confirmToOrder() {
      let options = {
        params: {
          company_id: this.company_id,
          cart_items: this.cartItems,
          room_id: this.room_id,
          booking_id: this.booking_id,
          room_number: this.room_number,
        },
      };
      this.loading = true;
      await this.$axios
        .post(`hotel_orders_food_items`, options.params)
        .then(({ data }) => {
          if (!data.status) {
            this.snackbar = true;
            this.snackbarMessage = data.message;
          } else {
            localStorage.setItem("QRCodeCartItems", JSON.stringify([]));
            // this.$store.commit("hotelQRCodeCartItems", []);
            this.$router.push("/orders");
          }
        });
      this.loading = false;
    },
    displyCartItems() {
      if (localStorage) {
        this.cartItems = JSON.parse(localStorage.getItem("QRCodeCartItems"));
      } else {
        this.cartItems = this.$store.state.hotelQRCodeCartItems;
      }
    },
    async getCompanyDetails(company_id) {
      let options = {
        params: {
          company_id: company_id,
        },
      };
      this.loading = true;
      await this.$axios
        .get(`company/${company_id}`, options)
        .then(({ data }) => {
          if (data.record) {
            this.food_tax = data.record.food_tax;

            this.displyCartItems();
          }
        });
      this.loading = false;
    },
    viewCart() {
      this.cartItemDialog = true;
    },
  },
};
</script>
