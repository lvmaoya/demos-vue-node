<template>
  <div class="app-container">
    <router-view />
    <ChatWidget botName="Test-bot" :endpointUrl="endpointUrl" :greetings="greetings" :questions="questions" />
  </div>
</template>

<script setup>
import { ChatWidget } from '@lvmaoya/chat-bot';
// 示例属性，可根据需要调整
const endpointUrl = "http://localhost:8080/h5/chat/rag/stream";
const greetings = ['您好，请问有什么可以帮到您？'];
const questions = [];
</script>

<style>
.app-container {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  transition: var(--transition);
}
</style>
