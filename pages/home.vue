<template>
  <span>
    <v-container class="mt-10">
      <!-- Hotel Information Card -->

      <style>
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(255, 255, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
          }
        }

        /* Apply animation to a button */
        .pulse-button {
          animation: pulse 1s infinite;
        }
      </style>

      <v-card class="mx-auto" max-width="600" elevation="0">
        <!-- <div style="width: 100%; text-align: center">
          <v-img src="/logo.png" style="width: 200px" alt="Hotel Image"></v-img>
        </div> -->
        <v-card-title class="headline"> HYDERSPARK LUXURY HOTEL </v-card-title>

        <v-card-text>
          <!-- Contact Information -->
          <v-row align="center" class="mt-1">
            <v-icon color="primary" class="mr-2">mdi-phone</v-icon>
            <span>+91 84894 60006</span>
          </v-row>
          <v-row align="center" class="mt-5">
            <v-icon color="primary" class="mr-2">mdi-email</v-icon>
            <span>hyderskodai@gmail.com</span>
          </v-row>
          <!-- Address -->
          <v-row align="center" class="mt-5">
            <div style="display: flex">
              <v-icon color="primary" class="mr-2">mdi-map-marker</v-icon>
              <span>
                298/A2, M.M Street, Near German Eye Hospital, Kodaikanal-624101,
                Dindugal District.
              </span>
            </div>
          </v-row>

          <p class="mt-10">
            Welcome to Hyderspark Hotel in Kodaikanal, Tamilnadu! Our 32
            luxurious rooms boast 3-star amenities for a comfortable stay. Host
            your events in Jasmin, our meeting hall for up to 90 members. Enjoy
            a delectable
          </p>
        </v-card-text>

        <v-card-title class="headline">
          <div
            class="text-center no-wrap"
            style="max-width: 248px; margin: 0 auto"
          >
            For A Holiday Beyond Your Expectations
          </div>
        </v-card-title>

        <v-card-text>
          <p class="mt-5">
            <v-img
              src="https://kodai.hyderspark.com/wp-content/uploads/2024/01/sofa-for-video-image.jpg"
              height="200px"
              alt="Hotel Image"
            >
              <div
                style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 200px;
                "
              >
                <WidgetsVideoPlayer
                  title="YouTube Video"
                  src="https://www.youtube.com/watch?v=cNC9D1L3KV0"
                />
              </div>
            </v-img>
          </p>
        </v-card-text>

        <v-card-title class="headline">
          <div
            class="text-center no-wrap"
            style="max-width: 252px; margin: 0 auto"
          >
            Discover The Amenities At Our Hotel
          </div>
        </v-card-title>

        <v-card-text>
          <p class="text-center">
            Excellent accommodation service with excellent spaces.
          </p>
          <v-card class="mt-2">
            <v-card-title class="headline">
              <div
                class="text-center no-wrap"
                style="max-width: 252px; margin: 0 auto"
              >
                <v-btn fab class="primary my-5" x-large>
                  <v-icon color="pa-5">mdi-domain </v-icon></v-btn
                >
                <br />
                <span> Best Accommodation</span>
              </div>
            </v-card-title>
            <v-card-text>
              <p class="text-center px-5">
                We provide the best hotel service with our affordable prices and
                high quality accommodation services.
              </p>
            </v-card-text>
          </v-card>

          <v-card class="mt-2">
            <v-card-title class="headline">
              <div
                class="text-center no-wrap"
                style="max-width: 252px; margin: 0 auto"
              >
                <v-btn fab class="primary my-5" x-large>
                  <v-icon color="pa-5">mdi-wifi</v-icon></v-btn
                >
                <br />
                <span> Services</span>
              </div>
            </v-card-title>
            <v-card-text>
              <p class="text-center px-5">
                We provide the best hotel service with our affordable prices and
                high quality accommodation services.
              </p>
            </v-card-text>
          </v-card>

          <v-card class="mt-2">
            <v-card-title class="headline">
              <div
                class="text-center no-wrap"
                style="max-width: 252px; margin: 0 auto"
              >
                <v-btn fab class="primary my-5" x-large>
                  <v-icon color="pa-5">mdi-bed</v-icon></v-btn
                >
                <br />
                <span> Most Luxurious Rooms</span>
              </div>
            </v-card-title>
            <v-card-text>
              <p class="text-center px-5">
                We provide the best hotel service with our affordable prices and
                high quality accommodation services.
              </p>
            </v-card-text>
          </v-card>

          <v-card class="mt-2">
            <v-card-title class="headline">
              <div
                class="text-center no-wrap"
                style="max-width: 252px; margin: 0 auto"
              >
                <v-btn fab class="primary my-5" x-large>
                  <v-icon color="pa-5">mdi-silverware-fork-knife</v-icon></v-btn
                >
                <br />
                <span> Best Food</span>
              </div>
            </v-card-title>
            <v-card-text>
              <p class="text-center px-5">
                We provide the best hotel service with our affordable prices and
                high quality accommodation services.
              </p>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-container>
    <v-card flat elevation="0" class="mt-2 mb-15 pb-10 primary" dark>
      <div class="text-center no-wrap" style="max-width: 252px; margin: 0 auto">
        <v-btn
          dense
          elevation="0"
          fab
          class="primary white--text mt-5 pb-0"
          x-large
        >
          <v-icon large>mdi-headphones</v-icon>
        </v-btn>
        <div class="text-center caption">+91 84894 60006</div>
        <div class="text-center headline">Customer Service</div>
      </div>
      <v-card-text>
        <p class="text-center">
          We are proud to provide the best service for you. We are trying to
          host you in the best way with our understanding of quality service,
          experienced and friendly staff.
        </p>
        <div class="d-flex justify-center">
          <v-icon
            @click="
              $utils.open_external_link(
                `https://www.facebook.com/people/Hyders-Park-The-Luxury-Hotel-Kodaikanal/100076343141737/`
              )
            "
            large
            >mdi-facebook</v-icon
          >
          <v-icon
            @click="
              $utils.open_external_link(
                `https://www.instagram.com/hydersparkkodai/`
              )
            "
            large
            class="mx-5"
            >mdi-instagram</v-icon
          >
          <v-icon
            @click="
              $utils.open_external_link(
                `https://x.com/i/flow/login?redirect_after_login=%2FHydersparkkodai`
              )
            "
            large
            >mdi-twitter</v-icon
          >
        </div>
      </v-card-text>
    </v-card>
  </span>
</template>

<script>
export default {
  layout: "qrcode",
  methods: {},
};
</script>
