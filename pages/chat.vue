<template>
  <div>
    <Chat
      v-if="company_id"
      :hotelId="company_id"
      :bookingRoomId="bookingRoomId"
      :bookingId="bookingId"
      :roomId="roomId"
      :roomNumber="roomNumber"
      :guestName="CustomerName"
    />
  </div>
</template>
<script>
import Chat from "../components/chat.vue";

export default {
  layout: "qrcode",
  components: { Chat },

  data() {
    return {
      company_id: null,
      bookingId: null,
      roomId: null,
      roomNumber: null,
      CustomerName: null,
      bookingRoomId: null,
    };
  },
  mounted() {
    this.company_id = this.$auth.user.company_id;
    this.bookingId = localStorage.getItem("hotelQrcodeBookingId");
    this.bookingRoomId = localStorage.getItem("hotelQrcodeBookingRoomId");

    this.roomId = localStorage.getItem("hotelQrcodeRoomId");
    this.roomNumber = localStorage.getItem("hotelQrcodeRoomNumber");
    this.CustomerName = localStorage.getItem("hotelQrcodeCustomerName");
  },

  created() {},
};
</script>
