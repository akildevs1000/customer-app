<template>
  <Chat :hotelId="3" :roomId="1203" :guestName="'Guest'" />
</template>
<script>
import Chat from "../components/chat.vue";

export default {
  components: { Chat },
};
</script>
