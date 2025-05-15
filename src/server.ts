import express from "express";
import dotenv from "dotenv";
dotenv.config();
import initDatebase from "./config/db";
import test from "./routes/test";
import auth, { authenticateForSocketIO } from "./routes/auth";
import user from "./routes/user";
import post from "./routes/post";
import { IncomingHttpHeaders } from "http";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import { createServer } from "http";
import { Server as SocketIoServer } from "socket.io";
import { Role, User } from "./types";
import { listenForMessage } from "./socket/listenForMssgs";
import {
  listenAcceptReq,
  listenStdFollowReq,
} from "./socket/listenForFollowAndAccept";

const origins: string[] = [
  "http://localhost:4444",
  "https://e81d-2401-4900-1c0f-df2b-438c-b2b8-f3d6-a0de.ngrok-free.app",
  process.env.FRONTEND,
];

const corsOptions: CorsOptions = {
  allowedHeaders: "Content-Type, Authorization",
  methods: "GET, POST, PUT, PATCH, DELETE",
  origin: origins,
  credentials: true,
};
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// for socket configuration
const server = createServer(app);
const io = new SocketIoServer(server, {
  cors: corsOptions,
});

const students: {
  [key: string]: string;
} = {};
const teachers: {
  [key: string]: string;
} = {};
initDatebase();

app.use("/test", test);
app.use("/auth", auth);
app.use("/user", user);
app.use("/posts", post);

app.get("/", (req, res) => {
  res.send("Hello Surya");
});

io.use((socket, next) => {
  let headers: IncomingHttpHeaders = socket.handshake.headers;
  authenticateForSocketIO(headers)
    .then((user) => {
      if (user) {
        socket.data.user = user;
        next();
      } else {
        console.log("no user found 1");
        next(new Error("Authentication error"));
      }
    })
    .catch((err) => {
      console.log("no user found");
      console.log(err);
      next(new Error("Authentication error"));
    });
});

io.on("connection", (socket) => {
  // socket.handshake.headers.cookie ;
  const user = socket.data.user as User;
  console.log("user from socket: ", user);

  // on connect
  if (user.role.isStudent) {
    students[user.username] = socket.id;
  } else {
    teachers[user.username] = socket.id;
  }

  listenForMessage(socket, io);
  listenStdFollowReq(socket, io);
  listenAcceptReq(socket, io);

  // on new user
  socket.on("new-user", (name) => {
    students[socket.id] = name;
    socket.broadcast.emit("user-connected", name);
  });

  // on disconnect
  socket.on("disconnect", () => {
    socket.broadcast.emit("online-status", {
      id: user.username,
      status: false,
      role: user.role,
    });
    if (user.role.isStudent) {
      delete students[user.username];
      console.log("student-offline", user.username);
    } else {
      delete teachers[user.username];
      console.log("tutor-offline", user.username);
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});

export { io, students, teachers };
