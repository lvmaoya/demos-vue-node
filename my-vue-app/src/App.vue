<template>
  <div class="app-container">
    <router-view />
    <ChatWidget :bubble="true" :endpointUrl="endpointUrl" :greetings="greetings" :questions="questions" />
  </div>
</template>

<script setup>
import { ChatWidget } from '@lvmaoya/chat-bot';
// 示例属性，可根据需要调整
const endpointUrl = "http://webchat-bot-t9rx.fcv3.1486648470098031.cn-hangzhou.fc.devsapp.net/chat";
const greetings = ['Hi, there! Lvmaoya is at your service! How can I assist you today?'];
const questions = [
  "What is the capital of France",
  "Who is the most handsome person in the world",
  "Please share a story with me",
  "Tell me a joke",
  "Introduce yourself",
];
</script>

<style>
.app-container {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  transition: var(--transition);
}
</style>
