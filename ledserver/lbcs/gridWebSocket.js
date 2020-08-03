document.addEventListener("DOMContentLoaded", function(_) {
    var ws = new WebSocket("ws://localhost:8888/websocket/");
    ws.onopen = function() {
        ws.send("Hello world");
    };
    ws.onmessage = function (e) {
        console.log("Raw data from server websocket: ", e.data);
        let {lednumber, red, green, blue } = JSON.parse(e.data);
        document.getElementById(`grid-item-${lednumber}`).style.backgroundColor = `rgb(${red}, ${green}, ${blue})`
        ws.send("Next please");
    };
})