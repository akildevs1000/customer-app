<template>
  <v-app>
    <style>
      body,
      header {
        font-size: 11px !important;
        max-width: 400px !important;
        /* width: 500px !important; */
        margin: auto !important;
      }

      .text-color {
        color: #8a8a8a;
      }
      .border-top {
        border-top: 1px solid #e0e0e0;
      }
      .border-bottom {
        border-bottom: 1px solid #e0e0e0;
      }
      .v-expansion-panels--inset > .v-expansion-panel--active {
        max-width: 100%;
      }
      .v-expansion-panel-header--active {
        background-color: #bababa;
      }

      .v-expansion-panel--active > .v-expansion-panel-header {
        min-height: 35px;
        background: #8888ff;
      }
    </style>

    <v-app-bar fixed app dense flat>
      <v-row align="center" no-gutters>
        <!-- Left side with location and date -->
        <v-col class="text-left" cols="4">
          <v-row no-gutters>
            <v-col cols="8">
              <div style="font-size: 11px" class="text-center">
                <span> {{ $dateFormat.dmy(new Date()) }}</span>
                <br />
                <span> {{ currentTime }}</span>
              </div>
            </v-col>
          </v-row>
        </v-col>

        <!-- Center title -->
        <v-col class="text-center" cols="4">
          <img src="/login/login-logo.png" style="width: 100%" />

          <span class="text-color">
            {{ $auth?.user?.company?.name }}
          </span>
        </v-col>
        <v-col style="font-size: 14px; text-align: center">
          Hi,
          {{
            customerName.length > 15
              ? customerName.substring(0, 15) + "..."
              : customerName
          }}
          <div><v-icon size="18">mdi-tag</v-icon>{{ roomNumber }}</div>
        </v-col>
      </v-row>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" absolute left temporary>
      <v-list nav dense dark app color="#1cae81" clipped="true">
        <v-list-item-group
          v-model="group"
          active-class="deep-purple--text text--accent-4"
        >
          <v-list-item>
            <v-list-item-title>
              <img src="../static/logo.png" style="height: 40px" />
            </v-list-item-title>
          </v-list-item>
          <v-list-item style="padding: 5px 0 0 0px">
            <v-list-item-icon class="ma-2">
              <v-icon>mdi mdi-home-outline </v-icon>
            </v-list-item-icon>

            <v-list-item-title> Home</v-list-item-title>
          </v-list-item>

          <v-list-item style="padding: 5px 0 0 0px">
            <v-list-item-icon class="ma-2">
              <v-icon>mdi mdi-food </v-icon>
            </v-list-item-icon>
            <v-list-item-title> Food Menu </v-list-item-title>
          </v-list-item>
          <v-list-item style="padding: 5px 0 0 0px">
            <v-list-item-icon class="ma-2">
              <v-icon>mdi mdi-cart </v-icon>
            </v-list-item-icon>
            <v-list-item-title> Cart Items</v-list-item-title>
          </v-list-item>

          <v-list-item style="padding: 5px 0 0 0px">
            <v-list-item-icon class="ma-2">
              <v-icon>mdi mdi-home-outline </v-icon>
            </v-list-item-icon>
            <v-list-item-title>Biils/Orders</v-list-item-title>
          </v-list-item>
          <v-list-item style="padding: 5px 0 0 0px">
            <v-list-item-icon class="ma-2">
              <v-icon>mdi mdi-airplane-takeoff </v-icon>
            </v-list-item-icon>
            <v-list-item-title> Check-out</v-list-item-title>
          </v-list-item>
          <v-list-item style="padding: 5px 0 0 0px">
            <v-list-item-icon class="ma-2">
              <v-icon>mdi mdi-card-account-phone </v-icon>
            </v-list-item-icon>
            <v-list-item-title> Phones</v-list-item-title>
          </v-list-item>

          <v-list-item style="padding: 5px 0 0 0px">
            <v-list-item-icon class="ma-2">
              <v-icon>mdi mdi-food </v-icon>
            </v-list-item-icon>
            <v-list-item-title style="color: red">Logout</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-container
      fluid
      style="max-width: 400px; margin: 0 auto; border: 1px solid #ccc"
    >
      <div class="header-bottom-image"></div>

      <div>
        <nuxt />
      </div>
    </v-container>

    <v-bottom-navigation
      :elevation="24"
      grow
      fill
      background-color="#FFF"
      fixed
      bottom
      right
      style="
        position: fixed;
        bottom: 0px;
        border-top: 1px solid #1cae81;
        z-index: 9999;
      "
    >
      <v-btn @click="goToPage('/home')" style="border-right: 0px solid #ddd">
        <!-- <span class="qrcode-color">Home</span> -->
        <v-avatar size="40">
          <v-icon color="primary">mdi mdi-home-outline</v-icon>
        </v-avatar>
      </v-btn>
      <!-- <v-btn
        @click="goToPage('/food_menu')"
        style="border-right: 0px solid #ddd"
      >

        <v-avatar size="40">
          <v-icon color="primary">mdi mdi-food</v-icon></v-avatar
        >


        cartItems
      </v-btn> -->

      <v-btn
        @click="goToPage('/food_menu')"
        style="border-right: 0px solid #ddd"
      >
        <v-badge
          v-if="cartItems.length"
          :color="cartItems.length > 0 ? 'error' : 'success'"
          :content="cartItems.length"
        >
          <v-icon color="primary">mdi mdi-food</v-icon>
        </v-badge>
        <v-icon v-else color="primary">mdi mdi-food</v-icon>
      </v-btn>
      <v-btn @click="goToPage('/orders')" style="border-right: 0px solid #ddd">
        <v-avatar size="40"
          ><v-icon color="primary">mdi-chef-hat</v-icon></v-avatar
        >
      </v-btn>

      <v-btn
        @click="$router.push(`/chat`)"
        style="border-right: 0px solid #ddd"
      >
        <!-- <span class="qrcode-color">Check-out</span> -->

        <v-badge
          v-if="unreadMessageCount"
          :color="unreadMessageCount > 0 ? 'error' : 'success'"
          :content="unreadMessageCount"
        >
          <v-icon color="primary">mdi-chat</v-icon>
        </v-badge>
        <v-icon v-else color="primary">mdi-chat</v-icon>
      </v-btn>

      <v-btn
        @click="goToPage('/checkout')"
        style="border-right: 0px solid #ddd"
      >
        <!-- <span class="qrcode-color">Check-out</span> -->
        <v-avatar size="40">
          <v-icon
            :color="
              checkout_request_datetime == null ||
              checkout_request_datetime == 'null'
                ? 'primary'
                : 'error'
            "
            >mdi-airplane-takeoff</v-icon
          ></v-avatar
        >
      </v-btn>

      <!-- <v-btn
        @click="$router.push(`/profile?company_id=3&room_id=92&room_no=101`)"
        style="border-right: 0px solid #ddd"
      >

        <v-avatar size="40">
          <v-icon color="primary">mdi-account</v-icon></v-avatar
        >
      </v-btn> -->
      <!-- <v-btn @click="goToPage('home')" style="border-right: 0px solid #ddd">
            <span class="qrcode-color">Phones</span>
            <v-icon class="qrcode-color">mdi mdi-card-account-phone</v-icon>
          </v-btn> -->
    </v-bottom-navigation>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    currentTime: "00:00:00",
    drawer: false,
    group: null,
    roomNumber: "",
    customerName: "",
    checkout_request_datetime: null,
    unreadMessageCount: 0,
    cartItems: [],
  }),
  auth: false,
  mounted() {
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString([], { hour12: false });
    }, 1000);

    setInterval(() => {
      this.cartItems = JSON.parse(
        localStorage.getItem("QRCodeCartItems") || "[]"
      );
    }, 1000 * 5);
    this.cartItems = JSON.parse(
      localStorage.getItem("QRCodeCartItems") || "[]"
    );
    // Watch for storage changes in case another tab/window updates it
    // Load cart items once on mount
    const storedItems = localStorage.getItem("QRCodeCartItems") || "[]";
    this.cartItems = storedItems ? JSON.parse(storedItems) : [];

    // Watch for storage changes in case another tab/window updates it
    window.addEventListener("storage", (event) => {
      console.log(event.key);

      if (event.key === "QRCodeCartItems") {
        this.cartItems = event.newValue ? JSON.parse(event.newValue) : [];
      }
    });

    this.roomNumber = localStorage.getItem("hotelQrcodeRoomNumber") || "---";

    this.customerName =
      localStorage.getItem("hotelQrcodeCustomerName") || "---";

    this.getChatUnreadmessages();

    setInterval(() => {
      this.getChatUnreadmessages();
    }, 1000 * 15);

    this.checkout_request_datetime = localStorage.getItem(
      "checkout_request_datetime"
    );
  },
  watch: {
    group() {
      this.drawer = false;
    },

    async $route(to, from) {
      console.log("Route changed from", from.fullPath, "to", to.fullPath);

      if (to.fullPath == " /chat") {
        setTimeout(() => {
          this.getChatUnreadmessages();
        }, 1000);
      }
    },
  },
  created() {},

  methods: {
    goToPage(name) {
      this.$router.push(name);
    },
    async getChatUnreadmessages() {
      let company_id = this.$auth.user?.company?.id || 0;
      //console.log("company_id", company_id);
      if (company_id == 0) {
        return false;
      }
      let options = {
        params: {
          company_id: company_id,
          booking_room_id:
            localStorage.getItem("hotelQrcodeBookingRoomId") || null,
        },
      };

      await this.$axios
        .get(`chat_get_guest_unread_messages`, options)
        .then(async ({ data }) => {
          this.unreadMessageCount = data.length;
        });
    },
  },
};
</script>
<style>
.profile-image {
  height: 250px;
  width: 250px;
  max-height: 250px;
  max-width: 100%;
  border-radius: 50%;
  object-fit: cover;
}
</style>
<style src="@/assets/css/chatStyles.css"></style>
