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
          <img
            src="@/static/logo.png"
            style="padding-top: 50%; max-width: 100%"
          />
        </v-col>
      </v-row>
      <v-expand-x-transition mode="in" hide-on-leave="true">
        <v-card v-show="expand" elevation="0">
          <v-card-text>
            <v-col cols="12" sm="12" md="12" lg="12" class="text-center">
              <div v-if="loadingStep1">
                Validating your Booking information. Please wait...
                <img src="@/static/loading.gif" width="200px" />
              </div>
              <v-card
                elevation="0"
                ref="form"
                v-if="whatsapp_number != ''"
                transition="slide-x-transition"
              >
                <v-card-text>
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
                  <div class="text-center pt-8">Hello</div>

                  <h2 style="color: black">{{ customerName }}</h2>

                  <p class="text-center pt-8">
                    Enter whatsapp OTP is sent to your Mobile Number: <br />
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
                </v-card-text>
                <!-- <v-divider class="mt-12"></v-divider> -->

                <div>
                  <v-btn
                    style="width: 250px"
                    class="otp-button"
                    desne
                    small
                    rounded
                    @click="verifyOtp()"
                  >
                    Verify OTP
                  </v-btn>
                </div>

                <div class="pt-3">
                  <v-btn text color="error" desne small @click="sendOTP()">
                    Resend
                  </v-btn>
                </div>
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
    pageValid: true,
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

    queryParams: null,
  }),

  mounted() {
    this.clearDefaults();
    setTimeout(() => {
      this.sendOTP();
    }, 1000);
    setTimeout(() => {
      this.welcomeSection = false;
      this.expand = true;
    }, 3000);
    this.$nextTick(function () {
      this.whatsapp_number = this.maskNumber(
        this.$store.state.hotelQrcodeWhatsappNumber
      );
      if (this.$store.state.hotelQrcodeRoomNumber) {
      } else {
        this.pageValid = false;
      }
    });
  },
  created() {
    this.$store.commit("hotelQRCodeOTPverified", false);
    // ?company_id=3&room_id=82&room_no=101
    // let { company_id, room_id, room_no } = this.$route.query;
    this.queryParams = this.$route.query;

    // this.whatsapp_number = this.maskNumber(
    //   this.$store.state.hotelQrcodeWhatsappNumber
    // );
    console.log("Home page");
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
      this.$axios.get(`get_checkin_customer_data`, options).then(({ data }) => {
        this.otp_sent = true;
        this.whatsapp_otp = data.record.whatsapp_otp;

        if (data.status) {
          const { company_id, room_no, room_id } = params;
          const customer = data.record.customer;

          // Commit data to the store
          this.$store.commit("hotelQrcodeCompanyId", company_id);
          this.$store.commit("hotelQrcodeRoomNumber", room_no);
          this.$store.commit("hotelQrcodeRoomId", room_id);
          this.$store.commit("customer_id", customer.id);
          this.$store.commit("hotelQrcodeWhatsappNumber", customer.whatsapp);

          // Update component state
          this.customer_otp = this.whatsapp_otp;
          this.loading = false;

          // Store data in localStorage
          const storageData = {
            hotelQrcodeCompanyId: company_id,
            hotelQrcodeRoomNumber: room_no,
            hotelQrcodeRoomId: room_id,
            hotelQrcodeBookingId: data.record.booking_id,
            customer_id: customer.id,
          };

          Object.entries(storageData).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });

          // Set component properties
          this.whatsapp_number = customer.whatsapp;
          this.profilePic =
            customer.image || "https://customer.myhotel2cloud.com/noimage.png";
          this.customerName = `${customer.title} ${customer.full_name}`;
        } 
        
        else if (data.status == false) {
          this.loading = false;
          this.message =
            "Check-in Details are not Found. <br/>Please scan QR code again.<br/> Sorry for the inconvenience";
        }
        setTimeout(() => {
          this.loadingStep1 = false;
        }, 3000);
      });

      setTimeout(() => {
        this.loading = false;
      }, 5000);
    },
    maskNumber(number) {
      if (number)
        return "X".repeat(Math.max(0, number.length - 5)) + number.slice(-4);
    },
    isPageValid() {
      if (this.$store.state.hotelQrcodeRoomNumber) {
        return true;
      } else {
        this.pageValid = false;
        return false;
      }
    },
    openPage(name) {
      this.$router.push("/qrcode/" + name);
    },

    verifyOtp() {
      console.log(this.whatsapp_otp, this.customer_otp);
      if (this.whatsapp_otp == this.customer_otp) {
        localStorage.setItem("hotelQRCodeOTPverified", true);
        this.$store.commit("hotelQRCodeOTPverified", true);

        localStorage.setItem("hotelQRCodeOTPverified", true);
        this.$router.push("/home");
      } else {
        this.error_message = "Invalid OTP";
      }
    },
  },
};
</script>
