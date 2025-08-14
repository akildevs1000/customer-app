<template>
  <v-app>
    <div class="text-center">
      <v-row
        ><v-col
          cols="12"
          sm="12"
          md="12"
          lg="12"
          class="text-center"
          v-if="welcomeSection"
        >
          <img src="/loading.gif" style="padding-top: 50%; max-width: 100%" />
        </v-col>
      </v-row>
      <v-expand-x-transition mode="in" hide-on-leave="true">
        <v-card v-show="expand" elevation="0">
          <v-card-text>
            <v-col cols="12" sm="12" md="12" lg="12" class="text-center">
              <div v-if="loadingStep1">
                Validating your Booking information. Please wait...
                <img src="/loading.gif" width="200px" />
              </div>
              <v-card
                elevation="0"
                ref="form"
                v-if="whatsapp_number != ''"
                transition="slide-x-transition"
              >
                <v-card-text>
                  <div>
                    <div
                      style="font-size: 20px; padding: 10px; font-weight: bold"
                    >
                      Welcome To
                    </div>
                    <img style="width: 200px" src="/login/login-logo.png" />

                    <v-row>
                      <v-col cols="12" class="pt-8"
                        ><v-chip
                          filter
                          label
                          color="primary"
                          style="padding: 20px; font-size: 30px"
                          ><v-icon left size="25">mdi-tag</v-icon> Room Number :
                          {{ room_number }}</v-chip
                        ></v-col
                      >
                      <v-col
                        cols="12"
                        style="font-size: 20px; font-weight: bold"
                      >
                        {{ customerName }}
                      </v-col>
                      <v-col cols="12" v-if="intro">
                        <img
                          src="/home1.jpeg"
                          @click="
                            sendOTP();
                            intro = false;
                          "
                          class="profile-image"
                        />
                      </v-col>
                    </v-row>

                    <v-col cols="12" v-if="intro">
                      <img
                        src="/home2.jpeg"
                        @click="
                          sendOTP();
                          intro = false;
                        "
                        class="profile-image"
                      />
                    </v-col>
                    <v-col cols="12" v-if="intro">
                      <v-btn
                        dense
                        fill
                        color="red"
                        style="color: #fff"
                        @click="
                          sendOTP();
                          intro = false;
                        "
                        >Click to Order
                        <v-icon class="pl-4" light>mdi-food</v-icon></v-btn
                      >
                    </v-col>
                    <v-col cols="12" v-if="!intro">
                      <v-row>
                        <v-col>
                          <img
                            :src="profilePic"
                            style="
                              max-height: 250px;
                              max-width: 100%;
                              border-radius: 50%;
                              height: 200px;
                              width: 200px;
                            "
                          />

                          <p class="text-center pt-8">
                            Enter whatsapp OTP is sent to your Mobile Number:
                            <br />
                            {{ maskNumber(whatsapp_number) }}
                          </p>

                          <v-text-field
                            clearable
                            dense
                            ref="name"
                            outlined
                            v-model="whatsapp_otp"
                            :error-messages="errorMessages"
                            label="Whatsapp OTP"
                            placeholder="Whatsapp OTP"
                            required
                            type="number"
                            append-icon="mdi mdi-whatsapp"
                          ></v-text-field>
                          <label style="color: red">{{ error_message }}</label>

                          <!-- <v-divider class="mt-12"></v-divider> -->

                          <div>
                            <v-btn
                              style="width: 250px"
                              class="otp-button primary"
                              desne
                              small
                              primary
                              @click="verifyOtp()"
                            >
                              Verify OTP
                            </v-btn>
                          </div>

                          <div class="pt-3">
                            <v-btn
                              text
                              color="error"
                              desne
                              small
                              @click="sendOTP()"
                            >
                              Resend
                            </v-btn>
                          </div>
                          <div class="pt-3">
                            <v-btn
                              style="width: 250px"
                              text
                              class="error"
                              desne
                              small
                              @click="intro = true"
                            >
                              Back To Home
                              <v-icon>mdi-home-circle-outline</v-icon>
                            </v-btn>
                          </div>
                        </v-col>
                      </v-row>
                    </v-col>
                  </div>
                </v-card-text>
              </v-card>
              <div style="padding-top: 60%; color: green" v-else-if="!loading">
                <img
                  src="@/static/logo.png"
                  style="padding-top: 0%; max-width: 100%"
                />
                <p class="pt-10" v-html="message"></p>
              </div>
            </v-col> </v-card-text
        ></v-card>
      </v-expand-x-transition>
    </div>
  </v-app>
</template>

<script>
export default {
  // layout: "qrcode",
  layout: "login",
  auth: false,
  data: () => ({
    loadingStep1: true,
    profilePic: "",
    welcomeSection: true,
    errorMessages: [],
    id: "",
    pageValid: false,
    whatsapp_otp: "",
    name: "",
    whatsapp_number: "",
    loading: false,
    customer_otp: "",
    error_message: "",
    otp_sent: false,
    lading: "",
    message: "Validating your Booking information. Please wait.. ",
    expand: false,
    customerName: "",
    intro: true,
    queryParams: null,
    room_number: "",
  }),

  mounted() {
    this.clearDefaults();
    this.sendOTP();
    setTimeout(() => {
      this.welcomeSection = false;
      this.expand = true;
    }, 3000);
  },
  // watch: {
  //   intro: {
  //     handler() {
  //       if (!this.intro) this.sendOTP();
  //     },
  //     deep: true,
  //   },
  // },
  created() {
    this.profilePic = process.env.APP_URL + "/noimage.png";
    // this.$store.commit("hotelQRCodeOTPverified", false);
    // http://localhost:3005/?company_id=3&room_id=92&room_no=101
    this.queryParams = this.$route.query;

    // if (!this.intro) {
    //   this.sendOTP();
    // }
  },
  methods: {
    sendOTP() {
      if (this.queryParams) {
        this.getGuestDetails(this.queryParams);
      }
    },
    clearDefaults() {
      localStorage.setItem("QRCodeCartItems", JSON.stringify([]));
    },
    getGuestDetails(params) {
      let options = {
        params: {
          ...params,
          otp: 1,
        },
      };
      this.loading = true;
      this.$axios
        .get(`get_checkin_customer_data`, options)
        .then(({ data }) => {
          this.otp_sent = true;

          if (data.status) {
            this.whatsapp_otp = data.record.whatsapp_otp;
            const { company_id, room_no, room_id } = params;
            const customer = data.record.customer;
            if (data.record.checkout_guest_request)
              localStorage.setItem(
                "checkout_request_datetime",
                data.record.checkout_guest_request
              );

            this.room_number = room_no;

            // Commit data to the store
            // this.$store.commit("hotelQrcodeCompanyId", company_id);
            // this.$store.commit("hotelQrcodeRoomNumber", room_no);
            // this.$store.commit("hotelQrcodeRoomId", room_id);
            // this.$store.commit("customer_id", customer.id);
            // this.$store.commit("hotelQrcodeWhatsappNumber", customer.whatsapp);

            localStorage.setItem("hotelQrcodeCompanyId", company_id);
            localStorage.setItem("hotelQrcodeRoomNumber", room_no);
            localStorage.setItem("hotelQrcodeRoomId", room_id);
            localStorage.setItem("customer_id", customer.id);
            localStorage.setItem(
              "hotelQrcodeBookingId",
              customer.record.booking_id
            );

            localStorage.setItem(
              "hotelQrcodeCustomerName",
              customer.title + " " + customer.full_name
            );
            localStorage.setItem("hotelQrcodeBookingRoomId", data.record.id);
            localStorage.setItem(
              "hotelQrcodeWhatsappNumber",
              customer.whatsapp
            );

            // Update component state
            this.customer_otp = this.whatsapp_otp;
            this.loading = false;

            // Store data in localStorage
            const storageData = {
              hotelQrcodeCompanyId: company_id,
              hotelQrcodeRoomNumber: room_no,
              hotelQrcodeRoomId: room_id,
              hotelQrcodeBookingRoomId: data.record.id,
              customer_id: customer.id,
            };

            Object.entries(storageData).forEach(([key, value]) => {
              localStorage.setItem(key, value);
            });

            // Set component properties
            this.whatsapp_number = customer.whatsapp;
            this.profilePic =
              customer.image || process.env.APP_URL + "/noimage.png";
            this.customerName = `${customer.title}. ${customer.full_name}`;

            this.pageValid = true;
          } else if (data.status == false) {
            this.loading = false;
            this.message =
              "Check-in Details are not Found.Please scan QR code again Sorry for the inconvenience";
            alert(this.message);
          }

          setTimeout(() => {
            this.loadingStep1 = false;
          }, 3000);
        })
        .catch((e) => {
          this.message =
            "Check-in Details are not Found.Please scan QR code again Sorry for the inconvenience";
          alert(this.message);
        });

      setTimeout(() => {
        this.loading = false;
      }, 5000);
    },
    maskNumber(number) {
      if (number)
        return "X".repeat(Math.max(0, number.length - 5)) + number.slice(-4);
    },
    openPage(name) {
      this.$router.push("/" + name);
    },

    verifyOtp() {
      console.log(this.whatsapp_otp, this.customer_otp);
      if (this.whatsapp_otp == this.customer_otp) {
        localStorage.setItem("hotelQRCodeOTPverified", true);
        this.$store.commit("hotelQRCodeOTPverified", true);

        localStorage.setItem("hotelQRCodeOTPverified", true);
        this.$router.push("/food_categories");
      } else {
        this.error_message = "Invalid OTP";
      }
    },
  },
};
</script>
