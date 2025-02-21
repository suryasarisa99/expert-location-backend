import { Socket, Server as SocketIoServer } from "socket.io";
import { handleStdFollowReq } from "../handlers/studentHandlers/stdFollowReqHandler";
import { teachers } from "../server";
import { students } from "../server";
import { handleTutorRequest } from "../handlers/tutorHandlers/tutorAcceptHandlers";

export function listenStdFollowReq(socket: Socket, io: SocketIoServer) {
  const user = socket.data.user;
  socket.on("follow-req", (data) => {
    console.log("follow req: ", data);
    handleStdFollowReq({
      username: user.username,
      name: user.name,
      role: user.role,
      id: data.to, // teacher id
    });
    if (user.role.isStudent && teachers[data.to]) {
      console.log("follow req sent data: ", {
        _id: user.username,
        name: user.name,
        status: "pending",
      });
      io.to(teachers[data.to]).emit("follow-req", {
        _id: user.username,
        name: user.name,
        status: "pending",
      });
    }
  });
}

export function listenAcceptReq(socket: Socket, io: SocketIoServer) {
  const user = socket.data.user;

  socket.on("accept-req", (data) => {
    console.log("accept req: ", data);
    handleTutorRequest({
      teacherUsername: user.username,
      teacherName: user.name,
      role: user.role,
      id: data.id,
      status: data.status,
      studentName: data.studentName,
    });
    console.log(user);
    if (user.role.isTutor && students[data.id]) {
      console.log("accept req: ", data);
      console.log(user);
      console.log("accept req sent data: ", {
        _id: user.username,
        status: data.status,
      });
      io.to(students[data.id]).emit("accept-req", {
        _id: user.username,
        status: data.status,
      });
    }
  });
}
