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
                    :src="profilePic ?? '@/static/noimage.png'"
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
  }),

  mounted() {
    localStorage.setItem("hotelQRCodeOTPverified", false);
    this.id = this.$route.params.id;
    this.$store.commit("hotelQrcodeID", this.id);
    if (localStorage) localStorage.setItem("hotelQrcodeID", this.id);
    this.clearDefaults();

    setTimeout(() => {
      this.sendOTP();
    }, 1000);
    setTimeout(() => {
      this.welcomeSection = false;
      this.expand = true;
    }, 3000);
    // this.$nextTick(function () {
    //   console.log(
    //     "hotelQrcodeWhatsappNumber",
    //     this.$store.state.hotelQrcodeWhatsappNumber
    //   );

    //   this.whatsapp_number = this.maskNumber(
    //     this.$store.state.hotelQrcodeWhatsappNumber
    //   );

    //   if (this.$store.state.hotelQrcodeRoomNumber) {
    //   } else {
    //     this.pageValid = false;
    //   }
    // });
  },
  created() {
    this.$store.commit("hotelQRCodeOTPverified", false);

    this.id = this.$route.params.id;
    this.$store.commit("hotelQrcodeID", this.id);
    try {
      if (localStorage) localStorage.setItem("hotelQrcodeID", this.id);
    } catch (ex) {}

    // this.whatsapp_number = this.maskNumber(
    //   this.$store.state.hotelQrcodeWhatsappNumber
    // );
    console.log("Home page");
  },
  methods: {
    sendOTP() {
      let IdArray = (this.id && this.id.split("-")) || [3, 208, 92];

      if (IdArray.length == 3) {
        this.getGuestDetails(IdArray[0], IdArray[2], IdArray[1]);
      }
    },
    clearDefaults() {
      localStorage.setItem("QRCodeCartItems", JSON.stringify([]));
    },
    getGuestDetails(company_id, roomId, roomNo) {
      let options = {
        params: {
          company_id: company_id,
          room_id: roomId,
          otp: 1,
        },
      };
      console.log("get_checkin_customer_data");
      this.loading = true;
      this.$axios.get(`get_checkin_customer_data`, options).then(({ data }) => {
        this.otp_sent = true;

        console.log("data", this.whatsapp_otp = data.record.whatsapp_otp);
        if (data.status == true) {
          this.$store.commit("hotelQrcodeRequestId", this.id);
          this.$store.commit("hotelQrcodeCompanyId", company_id);
          this.$store.commit("hotelQrcodeRoomNumber", roomNo);
          this.$store.commit("hotelQrcodeRoomId", roomId);
          this.$store.commit("customer_id", data.record.customer.id);
          this.$store.commit(
            "hotelQrcodeWhatsappNumber",
            data.record.customer.whatsapp
          );
          this.loading = false;
          this.customer_otp = data.record.whatsapp_otp;
          localStorage.setItem("hotelQrcodeCompanyId", company_id);
          localStorage.setItem("hotelQrcodeRoomNumber", roomNo);
          localStorage.setItem("hotelQrcodeRoomId", roomId);
          localStorage.setItem("hotelQrcodeBookingId", data.record.booking_id);
          localStorage.setItem("customer_id", data.record.customer.id);

          this.whatsapp_number = data.record.customer.whatsapp;
          this.profilePic = data.record.customer.image;

          this.customerName =
            data.record.customer.title + " " + data.record.customer.full_name;
        } else if (data.status == false) {
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
