<template>
  <v-app>
    <style>
      body {
        font-size: 11px !important;
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
    </style>
    <v-app-bar fixed app dense flat>
      <v-row align="center" no-gutters>
        <!-- Left side with location and date -->
        <v-col class="text-left" cols="4">
          <v-row no-gutters>
            <v-col cols="8">
              <div style="font-size: 11px" class="text-center text-color">
                <span class="text-color">
                  {{ $dateFormat.dmy(new Date()) }}</span
                >
                <br />
                <span class="text-color"> {{ currentTime }}</span>
              </div>
            </v-col>
          </v-row>
        </v-col>

        <!-- Center title -->
        <v-col class="text-center" cols="4">
          <img src="/login/login-logo.png" style="width: 100%" />
          <br />
          <span class="text-color">
            {{
              $auth?.user?.company?.name < 10
                ? $auth?.user?.company?.name
                : $auth?.user?.company?.name.slice(0, 1) + " & Co"
            }}
          </span>
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

    <v-container>
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
      <v-btn @click="goToPage('home')" style="border-right: 0px solid #ddd">
        <!-- <span class="qrcode-color">Home</span> -->
        <v-avatar size="40">
          <v-icon color="primary">mdi mdi-home-outline</v-icon>
        </v-avatar>
      </v-btn>
      <v-btn
        @click="goToPage('food_menu')"
        style="border-right: 0px solid #ddd"
      >
        <!-- <span class="qrcode-color">Food</span> -->
        <v-avatar size="40">
          <v-icon color="primary">mdi mdi-food</v-icon></v-avatar
        >
      </v-btn>
      <v-btn @click="goToPage('orders')" style="border-right: 0px solid #ddd">
        <!-- <span class="qrcode-color">My Orders</span> -->
        <v-avatar size="40"
          ><v-icon color="primary">mdi mdi-cart</v-icon></v-avatar
        >
      </v-btn>

      <v-btn
        @click="$router.push(`/chat`)"
        style="border-right: 0px solid #ddd"
      >
        <!-- <span class="qrcode-color">Check-out</span> -->
        <v-avatar size="40">
          <v-icon color="primary">mdi-chat</v-icon></v-avatar
        >
      </v-btn>

      <v-btn
        @click="$router.push(`/profile?company_id=3&room_id=92&room_no=101`)"
        style="border-right: 0px solid #ddd"
      >
        <!-- <span class="qrcode-color">Check-out</span> -->
        <v-avatar size="40">
          <v-icon color="primary">mdi-account</v-icon></v-avatar
        >
      </v-btn>
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
  }),
  auth: false,
  mounted() {
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString([], { hour12: false });
    }, 1000);
  },
  watch: {
    group() {
      this.drawer = false;
    },
  },
  created() {},
  methods: {
    goToPage(name) {
      this.$router.push(name);
    },
  },
};
</script>
