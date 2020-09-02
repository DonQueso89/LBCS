const allStateUrl = document.currentScript.getAttribute("allStateUrl");
const websocketUrl = document.currentScript.getAttribute("websocketUrl");
const randomColor = () => [
  Math.floor(Math.random() * 255),
  Math.floor(Math.random() * 255),
  Math.floor(Math.random() * 255),
];
const randomLedNumber = () => Math.floor(Math.random() * 144);
const randomRoute = (n) => {
  return Array(n)
    .fill(null)
    .map((_) => randomLedNumber())
    .reduce((acc, e) => Object.assign(acc, { [e]: randomColor() }), {})
};

document.addEventListener("DOMContentLoaded", function (_) {
  var ws = new WebSocket("ws://localhost:8888/websocket/");
  ws.onopen = function () {
    ws.send("Hello world");
  };
  ws.onmessage = function (e) {
    console.log("Raw data from server websocket: ", e.data);
    for (let { lednumber, red, green, blue } of JSON.parse(e.data)) {
      if ([red, green, blue].map(Number).reduce((a, b) => a + b) !== 0) {
        document.getElementById(
          `grid-item-${lednumber}`
        ).style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
      } else {
        document.getElementById(
          `grid-item-${lednumber}`
        ).style.backgroundColor = null;
      }
    }
    ws.send("Next please");
  };

  document
    .getElementById("reset-button")
    .addEventListener("click", async function (_) {
      const response = await fetch(allStateUrl, { method: "DELETE" });
      if (!response.ok) {
        alert("Error while resetting leds");
      }
    });

  document
    .getElementById("fill-button")
    .addEventListener("click", async function (_) {
      const response = await fetch(allStateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-json" },
        body: JSON.stringify({
          route: randomRoute(8),
        }),
      });
      if (!response.ok) {
        alert("Error while setting leds");
      }
    });
});
