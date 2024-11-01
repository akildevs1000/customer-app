<template>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-list>
            <v-list-item v-for="(message, index) in messages" :key="index">
              <v-list-item-content>
                <v-list-item-title>{{ index + 1 }}. {{ message }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import Pusher from "pusher-js";
  
  export default {
    layout: "qrcode",
    auth: false,
  
    data() {
      return {
        messages: [], // List to store incoming messages
      };
    },
    mounted() {
      // Enable Pusher logging - disable in production
      Pusher.logToConsole = true;
  
      // Initialize Pusher
      const pusher = new Pusher("3e73e17dab90ed28c030", {
        cluster: "ap2",
      });
  
      // Subscribe to the channel and bind to the event
      const channel = pusher.subscribe("my-channel");
      channel.bind("my-event", (data) => {
        this.messages.push(data.message);
      });
    },
  };
  </script>
  