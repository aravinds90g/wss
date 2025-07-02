const WebSocket = require("ws");
const http = require("http");

// Use environment PORT or default to 8080
const PORT = process.env.PORT || 8080;

// Create HTTP server first
const server = http.createServer();

// Create WebSocket server using the HTTP server
const wss = new WebSocket.Server({ server });

console.log("WebSocket server starting...");

wss.on("connection", (ws, request) => {
  const clientIP = request.socket.remoteAddress;
  console.log(`NodeMCU connected from IP: ${clientIP}`);

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "welcome",
      message: "Connected to WebSocket server on Render",
    })
  );

  // Send random number every 2 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const randomNumber = Math.floor(Math.random() * 100);
      console.log(`Sending random number: ${randomNumber} to ${clientIP}`);

      // Send as JSON for better handling
      ws.send(
        JSON.stringify({
          type: "random_number",
          value: randomNumber,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      clearInterval(interval);
    }
  }, 2000);

  // Handle incoming messages from NodeMCU
  ws.on("message", (data) => {
    console.log(`Received from ${clientIP}:`, data.toString());

    // Echo back or handle specific commands
    try {
      const message = JSON.parse(data.toString());
      if (message.type === "request_random") {
        const randomNumber = Math.floor(Math.random() * 100);
        ws.send(
          JSON.stringify({
            type: "random_response",
            value: randomNumber,
            timestamp: new Date().toISOString(),
          })
        );
      }
    } catch (e) {
      // Handle plain text messages
      console.log("Plain text message received:", data.toString());
    }
  });

  ws.on("close", (code, reason) => {
    console.log(
      `Connection closed from ${clientIP}. Code: ${code}, Reason: ${reason}`
    );
    clearInterval(interval);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error from ${clientIP}:`, error);
    clearInterval(interval);
  });
});

// Handle server errors
wss.on("error", (error) => {
  console.error("WebSocket Server error:", error);
});

// Start the server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`WebSocket server is running on port ${PORT}`);
  console.log(`Server URL: ws://0.0.0.0:${PORT}`);
  console.log("Server is ready to accept connections from NodeMCU");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully");
  wss.clients.forEach((ws) => {
    ws.close(1000, "Server shutting down");
  });
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully");
  wss.clients.forEach((ws) => {
    ws.close(1000, "Server shutting down");
  });
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
