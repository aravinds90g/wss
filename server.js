const WebSocket = require("ws");
const PORT = 8080;

const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`WebSocket server started on ws://localhost:${PORT}`);
});

wss.on("connection", (ws) => {
  console.log("NodeMCU connected");

  // Send random number every 2 seconds
  const interval = setInterval(() => {
    const randomNumber = Math.floor(Math.random() * 100);
    console.log("Sending:", randomNumber);
    ws.send(randomNumber.toString());
  }, 2000);

  ws.on("close", () => {
    console.log("Connection closed");
    clearInterval(interval);
  });
});
