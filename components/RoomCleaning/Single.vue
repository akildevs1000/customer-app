<template>
  <v-dialog v-model="dialog" height="300" width="300">
    <AssetsIconClose left="290" @click="dialog = false" />
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on"
        ><v-icon small color="purple">mdi-pencil-outline</v-icon></span
      >
    </template>

    <v-card v-if="item && item.id">
      <v-alert class="grey lighten-3" dense flat>
        <span>Details</span>
      </v-alert>

      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              v-model="item.room"
              label="Room"
              required
              hide-details
              readonly
            ></v-text-field>
          </v-col>
          <v-col>
            <v-text-field
              v-model="item.cleaned_by_user.name"
              label="Staff"
              hide-details
              readonly
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="item.date"
              label="Date"
              required
              hide-details
              readonly
            ></v-text-field>
          </v-col>

          <v-col cols="6">
            <v-text-field
              v-model="item.start_time"
              label="Start Time"
              required
              hide-details
              readonly
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="item.end_time"
              label="End Time"
              required
              hide-details
              readonly
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="item.total_time"
              label="Total Time"
              required
              hide-details
              readonly
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="item.status"
              label="Status"
              required
              hide-details
              readonly
            ></v-text-field>
          </v-col>
          <v-col v-if="item.voice_note" cols="12">
            <div>Voice (House Keeping)</div>
            <audio
              v-if="item.voice_note"
              controls
              style="width: 100%; height: 40px"
            >
              <source :src="item.voice_note" />
            </audio>
            <span v-else>---</span>
          </v-col>
          <v-col v-if="item.voice_note" cols="12">
            <div>Voice (Technician)</div>
            <audio
              v-if="item.maintenance_voice_note"
              controls
              style="width: 100%; height: 40px"
            >
              <source :src="item.maintenance_voice_note" />
            </audio>
            <span v-else>---</span>
          </v-col>
          <!-- <v-col cols="6" class="text-center pt-5">
            <v-chip
              v-if="item.status == `Cleaned`"
              outlined
              x-small
              color="green"
              dark
              >{{ item.status }}</v-chip
            >
            <v-chip v-else outlined small color="red" dark>{{
              item.status
            }}</v-chip>
          </v-col> -->
        </v-row>
        <!-- <v-row>
          <v-col class="text-center">
            <AssetsButton
              :options="{
                label: `Cancel`,
                icon: ``,
                color: `red`,
              }"
            />
            <AssetsButton
              :options="{
                label: `Submit`,
                icon: ``,
                color: `green`,
              }"
            />
          </v-col>
        </v-row> -->
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
      default: () => {},
    },
  },
  data: () => ({
    dialog: false,
  }),
};
</script>
