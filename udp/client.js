const dgram = require('dgram');
const readline = require('readline');

const client = dgram.createSocket('udp4');
const SERVER_PORT = 41234;
const SERVER_HOST = 'localhost';

// 接收服务器的消息
client.on('message', (msg) => {
  console.log(`\n服务器说: ${msg}`);
});

// 允许客户端在命令行输入并发送消息
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (line) => {
  client.send(line, SERVER_PORT, SERVER_HOST, (err) => {
    if (err) console.error(err);
  });
});
