<template>
  <div>
    <v-dialog v-model="dialogItemInfo" width="600px">
      <v-card>
        <v-card-actions class="popup-background">
          <span class="headline">Info</span>
          <v-spacer></v-spacer>

          <v-icon @click="dialogItemInfo = false"> mdi-close</v-icon>
        </v-card-actions>
        <!-- <v-toolbar class="rounded-md" color="background" dense flat dark>
          <span>Info</span>
          <v-spacer></v-spacer>
          <v-icon dark class="pa-0" @click="dialogItemInfo = false">
            mdi-close
          </v-icon>
        </v-toolbar> -->

        <v-card-text>
          <div v-html="dialogItemInfoData"></div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-card>
      <v-card-title
        style="padding: 4px; font-size: 14px; background-color: #b3b3b3"
      >
        <v-row>
          <v-col> <div>Check Out</div> </v-col>
          <v-col class="text-right">
            <div style="color: #1402f7">
              Reservation #{{ BookingData.reservation_no }}
            </div>
          </v-col>

          <v-col v-if="!isGroupBooking" style="max-width: 80px">
            <v-row>
              <v-col cols="12" class="text-right">
                <v-icon
                  small
                  color="primary"
                  @click="redirect_to_invoice(roomData.booking_id)"
                  >mdi-printer</v-icon
                >
                &nbsp;
                <v-icon
                  small
                  color="primary"
                  @click="redirect_to_invoice(roomData.booking_id)"
                  >mdi-download</v-icon
                >
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text dense v-if="allDataLoaded">
        <!-- <Heading class="mb-3" label="Transactions" /> -->

        <table v-if="!isGroupBooking" style="width: 100%; line-height: 30px">
          <tr style="font-size: 13px">
            <td class="text-center primary--text border-bottom">#</td>
            <td class="text-center primary--text border-bottom">Date</td>
            <td class="text-right primary--text border-bottom">Debit</td>

            <td class="text-right primary--text border-bottom">Credit</td>
            <td class="text-right primary--text border-bottom">info</td>
            <td class="text-right primary--text border-bottom">Balance</td>
          </tr>

          <tr
            style="font-size: 13px"
            v-for="(item, index) in transactions"
            :key="index"
          >
            <td class="text-left border-bottom">{{ ++index }}</td>
            <td class="text-left border-bottom">
              {{ item.created_at || "---" }}
            </td>
            <td class="text-right border-bottom">
              {{
                item && item.debit == 0
                  ? "---"
                  : $utils.currency_format(item.debit)
              }}
            </td>

            <td class="text-right border-bottom">
              {{
                item && item.credit == 0
                  ? "---"
                  : $utils.currency_format(item.credit)
              }}
            </td>
            <td class="text-center border-bottom">
              <v-icon @click="showTransactionInfo(item.desc)" size="18"
                >mdi-information</v-icon
              >
            </td>
            <td class="text-right border-bottom">
              {{ $utils.currency_format(item.balance) || "---" }}
            </td>
          </tr>

          <tr style="font-size: 13px">
            <td colspan="5" class="text-right primary--text">Total Balance</td>
            <td class="text-right pl-3 primary--text">
              {{ $utils.currency_format(totalTransactionAmount) }}
            </td>
          </tr>
        </table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
const today = new Date();

function formatTime(date) {
  let hours = date.getHours().toString().padStart(2, "0");
  let minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
export default {
  props: ["BookingData", "roomData"],

  data() {
    return {
      old_balance: 0,
      postingPaymentPayload: {
        paid: 0,
        balance: 0,
        payment_mode: "Cash",
        reference: "REF123456",
        discount: 0,
        after_discount: 0,
      },

      payment_mode_id: 1,
      change_checkout_time: false,

      grand_remaining_price: 0,
      remaining_price: 0,
      Testing: true,
      isHall: false,

      exceedHoursCharges: 0,
      isDiscount: false,
      snackbar: false,
      checkLoader: false,
      response: "",
      preloader: false,
      loading: false,
      show_password: false,
      show_password_confirm: false,
      transactions: [],
      totalTransactionAmount: 0,
      full_payment: 0,
      isPrintInvoice: false,
      discount: 0,
      tempBalance: 0,
      reference: "",
      customer: {
        title: "",
        whatsapp: "",
        nationality: "India",
        first_name: "",
        last_name: "",
        contact_no: "",
        email: "",
        id_card_type_id: "",
        id_card_no: "",
        car_no: "",
        no_of_adult: 1,
        no_of_child: 0,
        no_of_baby: 0,
        address: "",
        image: "",
        company_id: this.$auth.user.company.id,
        dob_menu: false,
        dob: null,
        exp_menu: false,
        exp: null,
      },
      after_discount_balance: 0,
      errors: [],

      checkOutDialog: false,
      allDataLoaded: false,
      isPaymentBeforeSubmitted: false,
      dialogItemInfo: false,
      dialogItemInfoData: null,
    };
  },
  created() {
    this.preloader = false;
    if (this.roomData && this.roomData.id) {
      this.calculateHoursQty(this.roomData.check_out_time);
      this.get_transaction();
    }
  },
  computed: {
    sub_customer() {
      return this.roomData?.sub_customer_room_history?.sub_customer || null;
    },
    posting_payment() {
      if (this.roomData && this.roomData.posting_payment) {
        return this.roomData.posting_payment;
      }
    },
    guestPostingAmount() {
      return this.roomData.postings.reduce((acc, cur) => {
        return (
          Math.round(
            (parseFloat(acc) + parseFloat(cur.amount_with_tax)) * 100
          ) / 100
        );
      }, 0);
    },
    setInitialBalance() {
      if (!this.posting_payment) {
        return 0;
      }

      if (this.posting_payment.paid == 0 && this.posting_payment.balance == 0) {
        return this.guestPostingAmount;
      }
      let total =
        parseFloat(this.guestPostingAmount) +
        parseFloat(this.posting_payment.balance);
      return total.toFixed(2);
    },
    isGroupBooking() {
      return this.BookingData.group_name == "yes";
    },
    customer_full_address() {
      let { customer } = this.roomData;

      if (!customer.state) {
        return "---";
      }

      return `${customer.state}, ${customer.city}, ${customer.zip_code}, ${customer.country}`;
    },
  },
  methods: {
    close() {
      this.checkOutDialog = false;
      this.allDataLoaded = false;
    },
    showTransactionInfo(info) {
      this.dialogItemInfo = true;
      this.dialogItemInfoData = info;
    },
    submitPayment() {
      this.$swal("Success!", "Payment has been done", "success");

      return;
      let after_discount =
        parseFloat(this.tempBalance) - parseFloat(this.discount);

      let payload = {
        balance: parseFloat(this.full_payment) - after_discount,
        after_discount: after_discount,
        booking_id: this.BookingData.id,
        grand_remaining_price: parseFloat(this.full_payment) - after_discount,
        remaining_price: parseFloat(this.full_payment) - after_discount,
        new_advance: parseFloat(this.full_payment),
        payment_mode_id: this.payment_mode_id,
        company_id: this.$auth.user.company.id,
        reference_number: this.reference,
        discount: this.discount,
        user_id: this.$auth.user.id,
        isHall: this.isHall,
        exceedHoursCharges: this.exceedHoursCharges,
        room_id: this.roomData.room_id,
      };

      this.loading = true;
      this.$axios
        .post("/process-payment", payload)
        .then(({ data }) => {
          if (!data.status) {
            this.errors = data.errors;
            this.loading = false;
          } else {
            this.loading = false;

            this.$swal("Success!", "Payment has been done", "success").then(
              () => {
                this.isPaymentBeforeSubmitted = true;
              }
            );
          }
        })
        .catch((e) => {
          this.loading = false;
          console.log(e);
        });
    },
    setPullPayment(tempBalance, discount) {
      this.full_payment = parseFloat(tempBalance) - parseFloat(discount);
    },
    get_after_discount_balance(amt = 0) {
      let discount = amt || 0;
      let blc = parseFloat(this.grand_remaining_price) - parseFloat(discount);
      this.after_discount_balance = blc.toFixed(2) || 0;
    },

    store_check_out() {
      // if (!this.isPaymentBeforeSubmitted) {
      //   this.submitPayment();
      // }
      // let full_payment = parseFloat(this.full_payment);
      // if (full_payment <= 0) {
      //   this.alert("Warning", "Payment should be greater than zero","error");
      //   return;
      // }
      let payload = {
        booking_id: this.BookingData.id,
        grand_remaining_price: this.grand_remaining_price,
        remaining_price: this.remaining_price,
        full_payment: parseFloat(this.full_payment),
        payment_mode_id: this.payment_mode_id,
        company_id: this.$auth.user.company.id,
        isPrintInvoice: this.isPrintInvoice,
        reference_number: this.reference,
        discount: this.discount,
        user_id: this.$auth.user.id,
        isHall: this.isHall,
        exceedHoursCharges: this.exceedHoursCharges,
        room_id: this.roomData.room_id,
        isPaymentBeforeSubmitted: this.isPaymentBeforeSubmitted,
      };

      this.loading = true;
      this.$axios
        .post("/check_out_room", payload)
        .then(({ data }) => {
          if (!data.status) {
            this.errors = data.errors;
            this.loading = false;
          } else {
            this.loading = false;
            this.$emit("close-dialog");
            this.$swal("Success!", "Room has been checked out", "success").then(
              () => {
                if (this.isPrintInvoice) {
                  this.redirect_to_invoice(data.bookingId);
                }
              }
            );
          }
        })
        .catch((e) => {
          this.loading = false;
          console.log(e);
        });
    },

    redirect_to_invoice(id) {
      let element = document.createElement("a");
      element.setAttribute("target", "_blank");
      element.setAttribute("href", `${process.env.BACKEND_URL}invoice/${id}`);
      document.body.appendChild(element);
      element.click();
    },

    can(per) {
      let u = this.$auth.user;
      return (
        (u && u.permissions.some((e) => e.name == per || per == "/")) ||
        u.is_master
      );
    },

    calculateHoursQty(actualCheckoutTime) {
      let { check_out, extra_hours, extra_booking_hours_charges, room } =
        this.roomData;

      if (room?.room_type?.type !== "hall") {
        this.isHall = false;
        return;
      }

      this.isHall = true;

      const extra_per_hour_charges = extra_booking_hours_charges / extra_hours;

      const start = new Date(check_out);
      let end = new Date(this.getCurrentDate() + " " + actualCheckoutTime);

      // Check if the end time is earlier than the start time, indicating it falls on the next day
      if (end < start) {
        // Add 24 hours (in milliseconds) to the end time
        end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      }

      const differenceInMs = end - start;

      const totalHours = Math.ceil(differenceInMs / (1000 * 60 * 60));

      this.exceedHoursCharges = Math.round(totalHours) * extra_per_hour_charges;

      this.transactions.push({
        created_at: this.getCurrentDate(),
        debit: this.exceedHoursCharges,
        credit: 0,
        balance: this.exceedHoursCharges,
        desc: "Extra hours charges",
      });
    },

    get_transaction() {
      let id = this.BookingData.id;
      let payload = {
        params: {
          company_id: this.$auth.user.company.id,
          // isHall: this.isHall,
          // exceedHoursCharges: this.exceedHoursCharges,
          // customer_id: this.BookingData.customer_id,
          // payment_mode_id: this.BookingData.payment_mode_id,
          // reference: this.reference,
          // user_id: this.$auth.user.id,
        },
      };
      this.$axios
        .get(`get_transaction_by_booking_id/${id}`, payload)
        .then(({ data }) => {
          this.transactions = data.transactions;
          this.totalTransactionAmount = data.totalTransactionAmount;
          this.tempBalance = data.totalTransactionAmount;
          this.full_payment = data.totalTransactionAmount;
          this.allDataLoaded = true;
        });
    },

    getCurrentDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    alert(title = "Success!", message = "hello", type = "error") {
      this.$swal(title, message, type);
    },

    setAfterDiscount(discount) {
      this.postingPaymentPayload.after_discount =
        parseFloat(this.setInitialBalance) - parseFloat(discount);
    },
    setNewBalance({ after_discount, paid }) {
      this.postingPaymentPayload.balance =
        parseFloat(after_discount) - parseFloat(paid);
    },
    async processPostingPayment() {
      let payload = {
        booking_id: this.roomData.booking_id,
        room_id: this.roomData.room_id,
        sub_customer_id: this.sub_customer.id,
        ...this.postingPaymentPayload,
      };

      console.log(payload);
      try {
        await this.$axios.post(`posting-payment`, payload);
        alert("Payment has been processed");
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>
