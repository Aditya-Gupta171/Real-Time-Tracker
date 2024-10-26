import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

// Middleware
app.set("view engine", "ejs");
app.use(express.static(path.join(path.resolve(), "public"))); 


app.get("/", function (req, res) {
  res.render("index");
});


io.on("connection", function (socket) {
  console.log("A user connected:", socket.id); 
  
  socket.on("send-location", function (data) {
    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", function () {
    io.emit("user-disconnected", socket.id);
    console.log("A user disconnected:", socket.id);
  });
});


server.listen(1111, () => {
  console.log("Server is running on port 1111");
});
