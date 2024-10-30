const { createMessage } = require("../controllers/messageController");

require("dotenv").config();
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http"); // 引入HTTP模块
const socketIo = require("socket.io"); // 引入socket.io

const userRoutes = require("../routes/user");
const studentRoutes = require("../routes/student");
const adminRoutes = require("../routes/admin");
const tutorRoutes = require("../routes/tutor");
const messageRoutes = require("../routes/message");
const chatRoutes = require("../routes/chat");
const groupRoutes = require("../routes/group");
const coordinatorRoutes = require("../routes/coordinator");
const projectRoutes = require("../routes/project");
const notificationRoutes = require("../routes/notification");

const app = express();
const server = http.createServer(app); // 使用http服务器来包装Express应用
const io = socketIo(server, {
  cors: {
    origin: "*", // 配置允许的源
    methods: ["GET", "POST"],
  },
});

// WebSocket逻辑
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("sendMessage", async (data) => {
    console.log("Message received:", data);
    try {
      const { chatId, senderId, content } = data;
      const savedMessage = await createMessage(chatId, senderId, content); // 直接传递参数
      io.emit("message", savedMessage); // 广播消息给所有连接的客户端
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", "Message saving failed");
    }
  });
});

// 增加JSON体大小限制
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(
  cors({
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/user/", userRoutes);
app.use("/student/", studentRoutes);
app.use("/admin/", adminRoutes);
app.use("/tutor/", tutorRoutes);
app.use("/message/", messageRoutes);
app.use("/chat/", chatRoutes);
app.use("/group/", groupRoutes);
app.use("/coordinator/", coordinatorRoutes);
app.use("/project/", projectRoutes);
app.use("/notification/", notificationRoutes);

mongoose
  .connect(process.env.MONG_URI)
  .then(() => {
    // 使用server.listen而不是app.listen
    server.listen(process.env.PORT, () => {
      console.log(`Connected to DB and listening on port ${process.env.PORT}!`);
    });
  })
  .catch((err) => console.log(err));
