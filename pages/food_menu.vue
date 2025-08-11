<template>
  <div v-if="pageValid == 'true'">
    <div class="text-center ma-2">
      <v-snackbar v-model="snackbar" top="top" color="secondary" elevation="24">
        {{ snackbarMessage }}
      </v-snackbar>
    </div>
    <v-dialog v-model="dialogPreviewImage" width="600px">
      <v-card>
        <v-card-title dense class="primary white--text background">
          <v-spacer></v-spacer>
          <v-icon
            @click="dialogPreviewImage = false"
            outlined
            dark
            color="white"
          >
            mdi mdi-close-circle
          </v-icon>
        </v-card-title>
        <v-card-text>
          <v-container>
            <img
              :src="`https://hms-backend.test/storage/hotel/food_menu/3/5.png`"
              style="width: 500px; height: auto"
          /></v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="cartItemDialog"
      width="100%"
      max-width="100%"
      style="max-width: 100% !important; margin: 0px !important"
    >
      <v-card>
        <v-card-title dense class="primary white--text background">
          <span> Food Items - {{ this.cartItems.length }} </span>

          <v-spacer></v-spacer>
          <v-icon @click="cartItemDialog = false" outlined dark color="white">
            mdi mdi-close-circle
          </v-icon>
        </v-card-title>
        <v-card-text style="padding: 0px" class="pt-2">
          <v-row
            :key="index"
            v-for="(items, index) in cartItems"
            style="border-bottom: 1px solid #ddd"
          >
            <v-col cols="5"> {{ items.name }} </v-col>
            <v-col cols="4" class="">
              <v-autocomplete
                v-model="items.qty"
                label="Qty"
                :items="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20]"
                dense
                outlined
                small
              ></v-autocomplete>
            </v-col>
            <v-col cols="3" class="pl-0 pr-0">
              <div style="font-size: 12px">
                {{ items.amount }} X {{ items.qty }}
              </div>
              <div style="font-weight: bold; text-align: center">
                {{ (items.amount * items.qty).toFixed(2) }}
              </div>
              <v-btn
                style="padding: 5px"
                desne
                small
                @click="addToCart(items, true)"
                dark
                filled
                color="green"
              >
                Update</v-btn
              >
            </v-col>
            <v-col cols="2">
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
            </v-col>
          </v-row>
          <!-- <v-divider></v-divider> -->
          <v-row>
            <v-col cols="4" style="color: red; font-size: 12px"
              >*Excluding GST</v-col
            >
            <v-col cols="4" style="font-weight: bold; text-align: center"
              >Total :</v-col
            >
            <v-col cols="4" style="font-weight: bold; text-align: center">
              <v-chip color="green" label outlined>{{
                cartTotalAmount.toFixed(2)
              }}</v-chip>
            </v-col>
          </v-row>

          <v-card-actions class="mt-5">
            <!-- <v-btn @click="cartItemDialog = false" dark filled color="red"
              >Close</v-btn
            > -->
            <v-spacer></v-spacer>
            <v-btn
              v-if="cartTotalAmount > 0"
              @click="confirmToOrder()"
              small
              dark
              filled
              color="primary"
              >Confirm to Order</v-btn
            >
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div class="text-center d-flex pb-4">
      <v-spacer></v-spacer>
    </div>

    <div style="text-align: center" v-if="loading">
      <img src="/loading.gif" width="200px" />
    </div>
    <v-row style="width: 100%; text-align: center; margin: 0px; z-index: 10">
      <v-col
        :key="counter1"
        cols="6"
        v-for="(timing, timeIndex, counter1) in timingsList"
      >
        <img
          @click="gotoCategoriesPage(timing)"
          elevation="24"
          class="p-5 boxshadow"
          :src="timing.image"
          width="100%"
          style="max-width: 100%; height: 200px"
        />
        <br />
        {{ timing.name }} Food Menu Timings
      </v-col>
    </v-row>

    <v-card-text style="height: 100px; margin-bottom: 200px">
      <v-btn
        style="margin-bottom: 100px"
        @click="viewCart()"
        color="pink"
        dark
        fixed
        bottom
        right
        fab
      >
        {{ cartItems.length }}<v-icon>mdi mdi-cart-plus</v-icon>
      </v-btn>
    </v-card-text>
  </div>
  <div v-else style="padding: 25%">UnAuthorised Access</div>
</template>

<script>
export default {
  layout: "qrcode",
  data: () => ({
    cartTotalAmount: 0,
    cartItemDialog: false,
    cartSelectDropdown: [],
    foodMenuList: [],
    itemNameSearch: "",
    key: 1,
    menu_open: true,
    data: [],
    id: "",
    panel1: [],
    panel2: [],
    panel3: [],
    items: 5,
    groupedCategories: [],
    groupedItems: [],
    cart_total_items: 0,
    cartItems: [],
    cartItemsObj: {},
    snackbar: false,
    snackbarMessage: "",
    loading: true,
    pageValid: false,
    imagePreviewSrc: "",
    dialogPreviewImage: false,
    timingsList: [],
    company_id: "",
  }),
  auth: false,
  watch: {
    cartItems: {
      handler() {
        let TotalAmount = 0;
        this.cartItems.forEach((element) => {
          TotalAmount = TotalAmount + element.amount * element.qty;
        });
        this.cartTotalAmount = TotalAmount;
      },
      deep: true,
    },
    // options_history: {
    //   handler() {
    //     this.getDataFromApi_history(this.viewHistoryItem);
    //   },
    //   deep: true,
    // },
  },
  mounted() {
    console.log(
      "hotelQRCodeOTPverified",
      localStorage.getItem("hotelQRCodeOTPverified")
    );
    if (localStorage)
      this.cartItems = JSON.parse(localStorage.getItem("QRCodeCartItems"));
    this.pageValid = localStorage.getItem("hotelQRCodeOTPverified");

    this.company_id = localStorage.getItem("hotelQrcodeCompanyId");

    this.getDataFromApi();
    setTimeout(() => {
      this.panel3 = [...Array(50).keys()].map((k, i) => i);
    }, 1000);

    this.getMenuItemsList();
    this.getTimingsList();
  },
  created() {
    this.$router.push("/food_categories");
    return;
    this.company_id = this.$store.state.hotelQrcodeCompanyId;
  },
  methods: {
    gotoCategoriesPage(item) {
      // this.$router.push("/food_categories/" + item.id + "-" + item.name);
      this.$router.push("/food_categories/" + item.id);
    },
    itemPreview(itemPreviewImage) {
      this.dialogPreviewImage = true;
      this.imagePreviewSrc = itemPreviewImage;
    },
    isPageValid() {
      return this.pageValid;
    },
    confirmToOrder() {
      this.$router.push("/cartItems");
    },
    viewCart() {
      this.cartItemDialog = true;
    },
    addToCart(item, update) {
      let foundItem = this.cartItems.find((e) => e.id === item.id);

      if (!foundItem) {
        item.qty = this.cartSelectDropdown[item.id];
        this.cartItems.push(item);
      } else {
        if (this.cartSelectDropdown[item.id] == 0) {
          if (confirm("Are you sure you want to delete " + item.name + "?")) {
            this.cartItems = this.cartItems.filter((e) => e.id !== item.id);
          }
        } else {
          if (update) {
            foundItem.qty = this.cartSelectDropdown[item.id];
          } else
            foundItem.qty =
              (foundItem.qty ?? 0) + this.cartSelectDropdown[item.id];
        }
      }
      this.cartItems = [...this.cartItems];

      this.snackbar = true;
      this.snackbarMessage = item.name + " - Cart Items are updated";

      localStorage.setItem("QRCodeCartItems", JSON.stringify(this.cartItems));
      //this.$store.commit("hotelQRCodeCartItems", this.cartItems);
    },
    getTimingsList() {
      let options = {
        params: {
          company_id: this.company_id,
        },
      };

      this.$axios
        .get(`get_hotel_menu_timings_dropdown`, options)
        .then(({ data }) => {
          this.timingsList = data;
        });
    },
    getMenuItemsList() {
      let options = {
        params: {
          company_id: this.company_id,
        },
      };

      this.$axios.get(`hotel_food_dropdown_list`, options).then(({ data }) => {
        this.foodMenuList = data;

        data.forEach((element1) => {
          this.cartSelectDropdown[element1.id] = 1;
        });
      });
    },
    getItemStatus(item) {
      if (item.status == 0) {
        return 0;
      } else if (item.status == 1) {
        let status = 2;
        item.timings.forEach((element) => {
          if (element.timings) {
            let itemStartHour = element.timings.start_hour;
            let itemEndtHour = element.timings.end_hour;
            const d = new Date();
            let hour = d.getHours();

            if (hour >= itemStartHour && hour <= itemEndtHour) {
              status = 1;
            }
          }
        });

        return status;
      }
    },
    getNewKey() {
      return this.key + 1;
      // this.key = this.key + 1;
      return Math.random() * 1000;
    },
    all() {
      this.menu_open = false;
      this.panel1 = [...Array(50).keys()].map((k, i) => i);
      this.panel2 = [...Array(50).keys()].map((k, i) => i);
      this.panel3 = [...Array(50).keys()].map((k, i) => i);
    },
    // Reset the panel
    none() {
      this.menu_open = true;
      this.panel1 = [];
      this.panel2 = [];
      this.panel3 = [];
    },

    getDataFromApi() {
      let options = {
        params: {
          company_id: this.company_id,
          item_name_search: this.itemNameSearch,
        },
      };

      this.$axios
        .get(`hotel_orders_customer_menu`, options)
        .then(({ data }) => {
          this.data = data;
          this.loading = false;
        });
    },

    groupItemsByTimingAndCategory1(items) {
      const groupedCategories = [];

      items.forEach((item) => {
        if (item.timings) {
          item.timings.forEach((elementtimings) => {
            if (elementtimings.timings) {
              const timingName = elementtimings.timings.name;
              const categoryName = item.category.name;

              if (!groupedCategories[timingName]) {
                groupedCategories[timingName] = [];
              }

              if (!groupedCategories[timingName][categoryName]) {
                groupedCategories[timingName][categoryName] = [];
              }

              groupedCategories[timingName][categoryName].push(item);
            }
          });
        }
      });

      return groupedCategories;
    },

    groupItemsByTimingAndCategory(items) {
      const groupedCategories = [];

      items.forEach((item) => {
        if (item.timings[0].timings) {
          const timingName = item.timings[0].timings.name;
          const categoryName = item.category.name;

          if (!groupedCategories[timingName]) {
            groupedCategories[timingName] = [];
          }

          if (!groupedCategories[timingName][categoryName]) {
            groupedCategories[timingName][categoryName] = [];
          }

          groupedCategories[timingName][categoryName].push(item);
        }
      });

      return groupedCategories;
    },
  },
};
</script>
