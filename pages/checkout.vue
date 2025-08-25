<template>
  <div v-if="pageValid == 'true'">
    <div class="text-center ma-10">
      <v-snackbar v-model="snackbar" top="top" color="secondary" elevation="24">
        {{ snackbarMessage }}
      </v-snackbar>
    </div>

    <v-card class="mt-2">
      <div style="text-align: center" v-if="loading">
        <img src="/loading.gif" width="200px" />
      </div>
      <v-card-title
        style="padding: 4px; font-size: 14px; background-color: #b3b3b3"
        dense
      >
        <span>Room Orders List(Postings) - Detailed Information </span>

        <v-spacer></v-spacer>
        <!-- Total Price {{ cartGrandTotalAmount }} -->
      </v-card-title>
      <v-card-text class="pa-0 pt-2" style="font-size: 12px">
        <AssetsTable
          height="300"
          :headers="[
            {
              text: `#`,
              value: `sno`,
              align: `left`,
            },
            // {
            //   text: `Room`,
            //   value: `room`,
            //   align: `center`,
            // },
            {
              text: `Date & Time`,
              value: `posting_date`,
              align: `center`,
            },
            // {
            //   text: `Room Type`,
            //   value: `room_type`,
            //   align: `center`,
            // },

            {
              text: `Name`,
              value: `name`,
              align: `left`,
            },
            {
              text: `Qty`,
              value: `qty`,
              align: `center`,
            },
            // {
            //   text: `Price`,
            //   value: `price`,
            //   align: `center`,
            // },
            {
              text: `Amount`,
              value: `amount`,
              align: `right`,
            },
            {
              text: `GST`,
              value: `gst`,
              align: `right`,
            },

            // {
            //   text: `Cgst`,
            //   value: `cgst`,
            //   align: `right`,
            // },

            {
              text: `Total`,
              value: `total`,
              align: `right`,
            },

            // {
            //   text: ``,
            //   value: `action`,
            //   align: `center`,
            //   width: `10px`,
            // },
          ]"
          :items="cartItems"
        >
          <template #sno="{ item }">
            {{ cartItems.indexOf(item) + 1 }}
          </template>

          <template #posting_date="{ item }">
            {{ $dateFormat.format4(item.posting_date) || "---" }}
          </template>

          <template #name="{ item }">
            {{ item.item }}
          </template>
          <template #qty="{ item }">
            {{ item.qty }} X
            {{ $utils.currency_format(item.single_amt) || "---" }}
          </template>
          <template #price="{ item }"> </template>
          <template #amount="{ item }">
            {{ $utils.currency_format(item.amount) || "---" }}
          </template>
          <template #gst="{ item }">
            {{ $utils.currency_format(item.tax) || "---" }}
          </template>

          <template #total="{ item }">
            <div style="font-weight: bold">
              {{ $utils.currency_format(item.amount_with_tax) || "---" }}
            </div>
          </template>
        </AssetsTable>
        <v-row
          ><v-col class="text-right bold pa-5 primary--text">
            Total : &nbsp;&nbsp;{{
              $utils.currency_format(cartGrandTotalAmount)
            }}
          </v-col></v-row
        >

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
    <Checkout
      class="mt-6"
      v-if="checkData && roomData"
      :BookingData="checkData"
      :roomData="roomData"
    />
    <v-row style="margin-top: 80px"
      ><v-col class="text-center">
        <v-btn
          v-if="
            !checkout_request_datetime || checkout_request_datetime == 'null'
          "
          @click="checkOut()"
          style="width: 100%"
          dark
          filled
          color="red"
          >Check Out</v-btn
        >

        <v-chip v-else color="green" style="color: #fff; text-align: center">
          Checkout is Requested at {{ checkout_request_datetime }}
        </v-chip></v-col
      ></v-row
    >
  </div>
  <div v-else style="padding: 25%">UnAuthorised Access</div>
</template>

<script>
import Checkout from "../components/Checkout.vue";

export default {
  components: { Checkout },
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
    checkout_request_datetime: null,
    checkData: null,
    roomData: null,
  }),
  auth: false,
  mounted() {
    if (localStorage) {
      this.company_id = localStorage.getItem("hotelQrcodeCompanyId");
      this.room_id = localStorage.getItem("hotelQrcodeRoomId");
      this.booking_id = localStorage.getItem("hotelQrcodeBookingId");
      this.booking_room_id = localStorage.getItem("hotelQrcodeBookingRoomId");

      this.room_number = localStorage.getItem("hotelQrcodeRoomNumber");
      this.pageValid = localStorage.getItem("hotelQRCodeOTPverified");
      this.checkout_request_datetime = localStorage.getItem(
        "checkout_request_datetime"
      );

      this.getOrderedList();
      this.getCheckOutdata();
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
    getCheckOutdata() {
      let payload = {
        params: {
          id: this.booking_room_id,
          company_id: this.company_id,
        },
      };
      this.$axios.get(`get_booked_room`, payload).then(({ data }) => {
        this.checkData = data.booking;
        this.roomData = data;
        // this.bookingId = data.booking.id;

        // this.rightClickRoomId = data.booking.resourceId;

        // this.full_payment = "";
        // this.bookingStatus = data.booking_status;
        // this.customerId = data.booking.customer_id;
        // if (this.isDbCLick) {
        //   this.get_event_by_db_click();
        // }
      });
    },
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
      // this.loading = true;
      this.$axios
        .get(`get-posting-by-booking-id-and-room-id`, options)
        .then(({ data }) => {
          console.log("data", data);

          this.cartItems = data;
          this.calculateTotal();

          this.loading = false;
        });
    },
    calculateTotal(item = null) {
      this.totals = {};
      this.cartGrandTotalAmount = 0; // reset before loop
      let panelCount = 0;

      let groupTotal = 0;

      for (let i = 0; i < this.cartItems.length; i++) {
        const order = this.cartItems[i];
        groupTotal += parseFloat(order.amount_with_tax, 2);
      }

      // add to grand total
      this.cartGrandTotalAmount += groupTotal;

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
      // this.loading = true;
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
      // this.loading = true;
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

    checkOut() {
      if (confirm("Are you sure want to Checkout Room? ")) {
        let options = {
          params: {
            company_id: this.company_id,
            booking_id: this.booking_id,

            booking_room_id: this.booking_room_id,
            room_id: this.room_id,
          },
        };
        // this.loading = true;
        this.$axios
          .post(`/hotel_orders_checkout_request`, options.params)
          .then(({ data }) => {
            if (data.status) {
              this.snackbar = true;
              this.checkout_request_datetime = data.record;
              this.checkout_request_datetime = new Date().toLocaleString(
                "en-US",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              localStorage.setItem(
                "checkout_request_datetime",
                this.checkout_request_datetime
              );
              this.snackbarMessage = data.message;
            } else {
              this.snackbar = true;
              this.snackbarMessage = data.message;
            }
          });
        this.loading = false;
      }
    },
  },
};
</script>
