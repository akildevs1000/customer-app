<template>
  <div v-if="pageValid == 'true'">
    <div class="text-center ma-6">
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
            <img :src="imagePreviewSrc" style="width: 500px; height: auto"
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
              <!-- <v-btn
                  style="padding: 5px"
                  desne
                  small
                  @click="addToCart(items, true)"
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
    <div class="text-center pb-5" style="margin-top: -20px">
      <h3>{{ categoryName }} List</h3>
    </div>
    <div class="text-center d-flex pb-4">
      <v-btn
        style="margin-top: 1px !important"
        color="green"
        class="ma-2 white--text"
        @click="goBackToCategories()"
        text
        outlined
        ><v-icon right dark> mdi mdi-step-backward </v-icon>
        Categories
      </v-btn>
      <!-- <v-btn
          v-if="menu_open"
          color="green"
          class="ma-2 white--text"
          @click="all"
        >
          Menu
          <v-icon right dark> mdi mdi-book-open-variant</v-icon>
        </v-btn>
        <v-btn
          v-else="menu_open"
          color="red"
          class="ma-2 white--text"
          @click="none"
        >
          Menu
          <v-icon right dark> mdi mdi-arrow-collapse-up </v-icon>
        </v-btn> -->
      <v-spacer></v-spacer>
      <span style="float: right">
        <v-autocomplete
          v-model="itemNameSearch"
          :items="foodMenuList"
          dense
          x-small
          outlined
          label="Search Item Name"
          placeholder="Item name"
          clearable
          item-text="name"
          item-value="name"
          @keyup="getSearchDataApi()"
          @change="getSearchDataApi()"
        >
        </v-autocomplete>
      </span>
    </div>

    <div style="text-align: center" v-if="loading">
      <img src="/loading.gif" width="200px" />
    </div>

    <v-row style="width: 100%; text-align: center; margin: 0px; z-index: 10">
      <v-col :key="index" cols="12" v-for="(item, index) in data">
        <v-row>
          <v-col cols="6">
            <!-- <img
              elevation="24"
              class="p-5 boxshadow"
              :src="item.item_picture"
              width="100%"
              style="max-width: 100%; height: 150px"
            /> -->
            <img
              class="p-5 boxshadow"
              :src="item.item_picture"
              width="100%"
              style="
                border: 1px solid #ddd;
                max-width: 100%;
                height: 160px;
                border-radius: 10px;
                object-fit: cover;
                cursor: pointer;
              "
            />
          </v-col>
          <v-col cols="6">
            <h3 class="qrcode-color">{{ item.name }}</h3>
            <div width="100%" style="height: 50px" class="overflow-auto">
              {{ item.description }}
            </div>
            <h3>₹{{ item.amount }}</h3>
            <div style="font-size: 20px" class="qrcode-color">
              <v-btn
                elevation="2"
                outlined
                plain
                dense
                @click="addToCart(item, +1)"
                color="error"
                v-if="
                  cartItems.find((e) => e.id == item.id) &&
                  cartItems.find((e) => e.id == item.id).qty == 0
                "
                >Add </v-btn
              ><v-btn
                elevation="2"
                outlined
                plain
                dense
                color="error"
                @click="addToCart(item, +1)"
                v-else-if="!cartItems.find((e) => e.id == item.id)"
                >Add
              </v-btn>
              <div v-else>
                <span
                  ><v-icon
                    color="red"
                    :disabled="getItemStatus(item) != 1"
                    @click="addToCart(item, -1)"
                    >mdi mdi-minus-box</v-icon
                  ></span
                ><span style="font-weight: bold">
                  {{ cartItems.find((e) => e.id == item.id)?.qty || 0 }}</span
                >
                <span
                  ><v-icon
                    color="green"
                    :disabled="getItemStatus(item) != 1"
                    @click="addToCart(item, +1)"
                    >mdi mdi-plus-box</v-icon
                  ></span
                >
              </div>
              <br />

              <v-btn
                small
                dense
                v-if="getItemStatus(item) == 0"
                color="grey"
                class="ma-0 white--text"
              >
                Out of Stock
              </v-btn>

              <v-btn
                small
                dense
                v-else-if="getItemStatus(item) == 2"
                color="grey"
                class="ma-2 white--text"
              >
                Out Of Time
              </v-btn>

              <!-- <span
                ><v-icon
                  color="error"
                  size="20"
                  style="float: right; margin-top: 5px"
                  >mdi mdi-close-circle</v-icon
                ></span
              > -->
            </div>
          </v-col>
        </v-row>

        <v-divider></v-divider>
      </v-col>
    </v-row>

    <v-row v-if="data.length == 0 && !loading">
      <v-col class="text-center">No Items are Availalbe.</v-col>
    </v-row>

    <v-card-text>
      <CartItemsComponent :key="cartkey" />
      <!-- <v-btn
        style="margin-bottom: 50px"
        @click="viewCart()"
        color="pink"
        dark
        fixed
        bottom
        dense
        small
        right
      >
        {{ cartItems.length }} Item(s)<v-icon size="20"
          >mdi mdi-cart-plus</v-icon
        >
        ₹{{ cartTotalAmount }}
      </v-btn> -->
    </v-card-text>
  </div>
  <div v-else-if="!loading" style="padding: 25%">UnAuthorised Access</div>
</template>

<script>
import CartItemsComponent from "../../components/CartItems.vue";

export default {
  components: { CartItemsComponent },
  layout: "qrcode",
  data: () => ({
    qty: [],
    categoryId: "",
    categoryName: "",
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
    category_id: "",
    cartkey: 1,
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
    //this.categoryId = this.$route.params.id;

    this.categoryId = this.$route.params.id; // this.$route.params.id.split("-")[0];
    this.categoryName = ""; //this.$route.params.id.split("-")[1];
    this.getDataFromApi();
    this.getMenuItemsList();
  },
  created() {
    this.company_id = this.$store.state.hotelQrcodeCompanyId;
    this.cartkey++;
  },
  methods: {
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
    goBackToCategories() {
      this.$router.push(
        "/food_categories/" + this.categoryId
        // "-" +
        // this.$store.state.timingName
      );
    },
    goToItemsPage(category) {
      this.$router.push("/food_items/" + category.id + "-" + category.name);
    },
    getDataFromApi() {
      let options = {
        params: {
          company_id: this.company_id,
          category_id: this.categoryId,
        },
      };

      this.$axios
        .get(`get_food_items_by_category`, options)
        .then(({ data }) => {
          this.data = data;
          this.loading = false;
        });
    },
    getSearchDataApi() {
      if (!this.itemNameSearch) {
        return this.getDataFromApi();
      }
      let options = {
        params: {
          company_id: this.company_id,
          item_name: this.itemNameSearch,
        },
      };

      this.$axios.get(`get_food_items_by_search`, options).then(({ data }) => {
        this.data = data;
        this.loading = false;
      });
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

      // if (!foundItem) {
      //   this.qty[item.id] = 1;
      //   this.cartItems.push(item);
      // } else {
      //   if (this.qty[item.id] == 0) {
      //     if (confirm("Are you sure you want to delete " + item.name + "?")) {
      //       this.cartItems = this.cartItems.filter((e) => e.id !== item.id);
      //     }
      //   } else {
      //     if (update) {
      //       foundItem.qty = this.qty[item.id]; //this.cartSelectDropdown[item.id];
      //     } else
      //       foundItem.qty =
      //         (foundItem.qty ?? 0) + this.cartSelectDropdown[item.id];
      //   }
      // }
      this.cartItems = [...this.cartItems];

      this.snackbar = true;
      this.snackbarMessage = item.name + " - Cart Items are updated";

      localStorage.setItem("QRCodeCartItems", JSON.stringify(this.cartItems));
      this.cartkey++;
      //this.$store.commit("hotelQRCodeCartItems", this.cartItems);
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
  },
};
</script>
