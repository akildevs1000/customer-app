<template>
  <div>
    <v-snackbar v-model="snackbar" centered color="secondary" elevation="24">
      {{ snackbarMessage }}
    </v-snackbar>
    <v-dialog
      v-model="cartItemDialog"
      width="100%"
      max-width="100%"
      style="max-width: 100% !important; margin: 0px !important"
    >
      <v-card>
        <v-card-title dense class="primary white--text background">
          <span> Food Items - Total {{ this.cartItems.length }} </span>

          <v-spacer></v-spacer>
          <v-icon @click="cartItemDialog = false" outlined dark color="white">
            mdi mdi-close-circle
          </v-icon>
        </v-card-title>
        <v-card-text style="" class="pt-2">
          <v-row
            :key="index"
            v-for="(item, index) in cartItems"
            style="border-bottom: 1px solid #ddd"
          >
            <v-col> {{ item.name }} </v-col>
            <!-- <v-col cols="4" class="">
              <v-autocomplete
                v-model="item.qty"
                label="Qty"
                :items="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20]"
                dense
                outlined
                small
              ></v-autocomplete>
            </v-col> -->

            <v-col cols="5" class="text-right">
              {{ item.amount }}
              <span
                ><v-icon color="red" @click="addToCart(item, -1)"
                  >mdi mdi-minus-box</v-icon
                ></span
              ><span style="font-weight: bold">
                {{ cartItems.find((e) => e.id == item.id)?.qty || 0 }}</span
              >
              <span
                ><v-icon color="green" @click="addToCart(item, +1)"
                  >mdi mdi-plus-box</v-icon
                ></span
              >
            </v-col>
            <v-col cols="3" class="pl-0 pr-0 text-right">
              <!-- <span style="font-size: 12px">
                {{ item.amount }} X {{ item.qty }}
              </span> -->
              <span style="font-weight: bold; text-align: right">
                {{ (item.amount * item.qty).toFixed(2) }}
              </span>
              <!-- <v-btn
                style="padding: 5px"
                desne
                small
                @click="addToCart(item, true)"
                dark
                filled
                color="green"
              >
                Update</v-btn
              > -->
            </v-col>
            <!-- <v-col cols="2">
              <v-btn
                icon
                desne
                small
                @click="cartItemDialog = false"
                dark
                filled
                color="green"
              >
                <v-icon>mdi mdi-checkbox-marked-circle</v-icon></v-btn
              >
            </v-col> -->
          </v-row>
          <!-- <v-divider></v-divider> -->
          <v-row>
            <v-col style="color: red; font-size: 12px">*Excluding GST</v-col>
            <!-- <v-col cols="4" style="font-weight: bold; text-align: center"
              >Total :</v-col
            > -->
            <v-col
              cols="8"
              class="text-right pr-0"
              style="font-weight: bold; text-align: right"
            >
              Total :
              <v-chip color="green" label outlined>{{
                cartTotalAmount.toFixed(2)
              }}</v-chip>
            </v-col>
          </v-row>

          <v-card-actions class="mt-5 text-center">
            <!-- <v-btn @click="cartItemDialog = false" dark filled color="red"
              >Close</v-btn
            > -->
            <v-spacer></v-spacer>
            <v-btn
              v-if="cartTotalAmount > 0"
              @click="confirmToOrder()"
              small
              right
              dark
              filled
              color="primary"
              >Confirm to Order</v-btn
            >
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-btn
      style="margin-bottom: 50px; padding: 0 16px"
      @click="cartItemDialog = true"
      color="pink"
      dark
      fixed
      bottom
      right
      small
      dense
    >
      <span>{{ cartItems.length }} Item(s)</span>
      <v-icon size="20" class="ml-2">mdi-cart-plus</v-icon>
      <span class="ml-2">₹{{ cartTotalAmount }}</span>
    </v-btn>
  </div>
</template>

<script>
export default {
  // props: ["cartItems"],
  data: () => ({
    cartItemDialog: false,
    cartTotalAmount: 0,
    cartItems: [],
    company_id: "",
    room_id: "",
    booking_id: "",
    room_number: "",
    pageValid: false,
    snackbar: false,
    snackbarMessage: "",
  }),
  watch: {
    cartItems: {
      handler() {
        this.getTotal();
      },
      deep: true,
    },
  },
  mounted() {
    if (localStorage) {
      // this.getCompanyDetails(localStorage.getItem("hotelQrcodeCompanyId"));
      this.company_id = localStorage.getItem("hotelQrcodeCompanyId");
      this.room_id = localStorage.getItem("hotelQrcodeRoomId");
      this.booking_id = localStorage.getItem("hotelQrcodeBookingRoomId");
      this.room_number = localStorage.getItem("hotelQrcodeRoomNumber");
      this.pageValid = localStorage.getItem("hotelQRCodeOTPverified");
    } else {
    }
  },
  created() {
    this.getTotal();
    this.cartItems = JSON.parse(localStorage.getItem("QRCodeCartItems"));
  },
  methods: {
    confirmToOrder() {
      let options = {
        params: {
          company_id: this.$auth.user.company_id,
          cart_items: this.cartItems,
          room_id: this.room_id,
          booking_id: this.booking_id,
          room_number: this.room_number,
        },
      };
      this.loading = true;
      this.$axios
        .post(`hotel_orders_add_food_items`, options.params)
        .then(({ data }) => {
          if (!data.status) {
            this.snackbar = true;
            this.snackbarMessage = data.message;
          } else {
            this.snackbar = true;
            this.snackbarMessage = "Food Request is added to Kitchen";
            localStorage.setItem("QRCodeCartItems", JSON.stringify([]));
            //this.$store.commit("hotelQRCodeCartItems", []);

            setTimeout(() => {
              this.$router.push("/orders");
            }, 1000 * 2);
            //
          }
        });
    },
    getTotal() {
      let TotalAmount = 0;
      this.cartItems.forEach((element) => {
        TotalAmount = TotalAmount + element.amount * element.qty;
      });
      this.cartTotalAmount = TotalAmount;
    },
    addToCart(item, changeQty) {
      let foundItem = this.cartItems.find((e) => e.id === item.id);

      if (!foundItem && changeQty > 0) {
        this.cartItems.push({ ...item, qty: 1 });
      } else {
        if (foundItem.qty + changeQty == 0) {
          if (confirm("Are you sure want to Delete Item?")) {
            this.cartItems = this.cartItems.filter((e) => e.id !== item.id);
          }
        } else foundItem.qty = foundItem.qty + changeQty;
      }

      console.log("Cart Items:", this.cartItems);

      this.cartItems = [...this.cartItems];

      this.snackbar = true;
      this.snackbarMessage = item.name + " - Cart Items are updated";
      this.getTotal();
      localStorage.setItem("QRCodeCartItems", JSON.stringify(this.cartItems));
      //this.$store.commit("hotelQRCodeCartItems", this.cartItems);
    },
  },
};
</script>
