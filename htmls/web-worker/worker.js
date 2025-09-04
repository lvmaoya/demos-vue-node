self.onmessage = function (e) {
  if (e.data === "start") {
    for (let i = 0; i < 1e6; i++) {
      console.log(i, "------", Math.random() * i);
    }
  }
};
