const dgram = require('dgram');
const readline = require('readline');

const server = dgram.createSocket('udp4');

// 存储客户端信息
let clientInfo = null;

server.on('message', (msg, rinfo) => {
  console.log(`\n客户端说: ${msg}`);

  // 记录客户端地址和端口
  clientInfo = rinfo;
});

// 监听端口
server.bind(41234, () => {
  console.log('✅ UDP 服务器运行中，监听 41234 端口');
});

// 允许服务端在命令行输入并发送消息
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (line) => {
  if (clientInfo) {
    server.send(line, clientInfo.port, clientInfo.address, (err) => {
      if (err) console.error(err);
    });
  } else {
    console.log('⚠️ 还没有客户端连接，无法发送消息');
  }
});
