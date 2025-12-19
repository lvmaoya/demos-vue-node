export function p1() {
  console.log('A');
  setTimeout(() => console.log('B'), 0);
  Promise.resolve().then(() => console.log('C'));
  console.log('D');
}
// adcb
export function p2() {
  Promise.resolve().then(() => console.log('A'));
  Promise.resolve().then(() => console.log('B'));
  queueMicrotask(() => console.log('C'));
  console.log('D');
}
// dabc
export function p3() {
  Promise.resolve().then(() => {
    console.log('A');
  }).then(() => {
    console.log('B');
  });
  console.log('C');
}
// cab
export function p4() {
  async function run() {
    console.log('A');
    await Promise.resolve();
    console.log('B');
  }
  run();
  console.log('C');
}
// acb
export function p5() {
  console.log('A');
  setTimeout(() => {
    console.log('B');
    Promise.resolve().then(() => console.log('C'));
  }, 0);
  Promise.resolve().then(() => console.log('D'));
  console.log('E');
}
// aedbc
export function p6() {
  setTimeout(() => console.log('A'), 0);
  setTimeout(() => console.log('B'), 10);
  console.log('C');
  Promise.resolve().then(() => console.log('D'));
}
// cdab
export function p7() {
  console.log('A');
  requestAnimationFrame(() => console.log('B'));
  Promise.resolve().then(() => console.log('C'));
  console.log('D');
}
// adcb
export function p8() {
  const channel = new MessageChannel();
  channel.port1.onmessage = () => console.log('A');
  channel.port2.postMessage('x');
  setTimeout(() => console.log('B'), 0);
  console.log('C');
  Promise.resolve().then(() => console.log('D'));
}
export function p9() {
  let count = 0;
  function loop() {
    if (count++ < 3) {
      Promise.resolve().then(loop);
    }
  }
  loop();
  setTimeout(() => console.log('A'), 0);
  console.log('B');
}

export function p10() {
  const target = document.createElement('div');
  const mo = new MutationObserver(() => console.log('A'));
  mo.observe(target, { childList: true });
  target.append('1');
  target.append('2');
  Promise.resolve().then(() => console.log('B'));
  console.log('C');
}

export function p11() {
  const btn = document.createElement('button');
  btn.textContent = 'Click';
  document.body.appendChild(btn);
  btn.addEventListener('click', () => {
    console.log('A');
    setTimeout(() => console.log('B'), 0);
    Promise.resolve().then(() => console.log('C'));
  });
  console.log('D');
}

export function p12() {
  Promise.resolve().then(() => {
    console.log('A');
    throw new Error('x');
  }).catch(() => console.log('B'));
  setTimeout(() => {
    console.log('C');
    throw new Error('y');
  }, 0);
  console.log('D');
}

