<template>
  <span>
    <v-container class="mt-15">
      <!-- Profile Card -->
      <v-row>
        <v-col cols="12" class="text-center">
          <v-avatar size="200">
            <img
              src="https://customer.myhotel2cloud.com/noimage.png"
              alt="Customer Photo"
            />
          </v-avatar>
        </v-col>
        <v-col cols="12" class="text-center">
          <h1 class="text-color">John Doe</h1>
          <h3 class="text-color primary--text">Reservation # 10</h3>
          <!-- <div class="text-color heading">Checked into Room 305</div> -->
          <div class="text-color primary--text heading"></div>
          

        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <!-- Room Details -->

          <v-list>
            <v-list-item class="my-1 py-0">
              <v-list-item-avatar size="50" color="primary">
                <v-icon color="white">mdi-bed</v-icon>
              </v-list-item-avatar>

              <v-list-item-content class="text-color">
                <v-list-item-title>
                  <v-text-field
                    hide-details
                    label="Room Category"
                    value="Deluxe Suite"
                  ></v-text-field>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="my-1 py-0">
              <v-list-item-avatar size="50" color="primary">
                <v-icon color="white">mdi-calendar-check</v-icon>
              </v-list-item-avatar>

              <v-list-item-content class="text-color">
                <v-list-item-title>
                  <v-text-field
                    hide-details
                    label="Check-in Date"
                    value="November 5, 2024"
                  ></v-text-field>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="my-1 py-0">
              <v-list-item-avatar size="50" color="primary">
                <v-icon color="white">mdi-calendar</v-icon>
              </v-list-item-avatar>

              <v-list-item-content class="text-color">
                <v-list-item-title>
                  <v-text-field
                    hide-details
                    label="Check-out Date"
                    value="November 7, 2024"
                  ></v-text-field>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <!-- Checkout Confirmation Dialog -->
      <v-dialog v-model="checkoutDialog" max-width="400">
        <v-card>
          <v-card-title class="headline">Confirm Checkout</v-card-title>
          <v-card-text>Are you sure you want to check out?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="checkoutDialog = false">Cancel</v-btn>
            <v-btn color="red" text @click="confirmCheckout"
              >Yes, Check Out</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
    <div style="position: relative">
      <v-btn
        style="
          position: absolute;
          bottom: -220px;
          width: 100%;
          overflow: hidden;
        "
        block
        rounded
        color="primary"
        @click="checkout"
        >Check Out</v-btn
      >
    </div>
  </span>
</template>

<script>
export default {
  layout: "qrcode",
  data() {
    return {
      checkoutDialog: false, // Controls the confirmation dialog visibility
    };
  },
  methods: {
    checkout() {
      this.checkoutDialog = true;
    },
    confirmCheckout() {
      this.checkoutDialog = false;
      // Logic to handle checkout
      alert("You have successfully checked out.");
    },
  },
};
</script>
