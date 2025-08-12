<template>
  <Chat
    :hotelId="3"
    :bookingId="1203"
    :roomId="1203"
    :roomNumber="1203"
    :guestName="'Guest'"
  />
</template>
<script>
import Chat from "../components/chat.vue";

export default {
  components: { Chat },
};
</script>
