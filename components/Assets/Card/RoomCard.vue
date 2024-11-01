<template>
  <span>
    <div class="roombox1" v-for="(room, i) in data" :key="i">
      <v-card>
        <v-card-text
          class="blue1111 p-3 roombox booked"
          :style="'padding: 0px;'"
          title="Expected Arrival"
        >
          <div class="text-center white--text boxheight">
            <div>
              {{ room?.room_no || "---" }}
            </div>
            <div>
              {{
                room.booked_room.booking.booking_type !== "hall"
                  ? room.room_type.name
                  : "---"
              }}
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </span>
</template>
<script>
export default {
  props: ["data"],
};
</script>
