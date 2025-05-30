import { Socket } from "socket.io/dist";
import { Server as SocketIoServer } from "socket.io";
import { Role, User } from "../types";
import { saveMessage } from "../handlers/saveMessage";
import { teachers } from "../server";
import { students } from "../server";
import { getAnswer } from "../config/geminiApi";
import Tutor from "../models/teacher";

export function listenForMessage(socket: Socket, io: SocketIoServer) {
  const user = socket.data.user as User;
  socket.on("new-mssg", async (data) => {
    saveMessage(data.mssg, user.username, data.to, user.role, data.img);
    if (user.role.isStudent) {
      if (teachers[data.to]) {
        // teacer is online, emit student message to teacher
        io.to(teachers[data.to]).emit("new-mssg", {
          from: user.username,
          mssg: data.mssg,
          isStudent: true,
          img: data.img,
        });
      } else {
        // teacher is offline, send ai response to student
        const tutor = await Tutor.findById(data.to, {
          name: 1,
          phone: 1,
          email: 1,
          skills: 1,
          educations: 1,
          workExperiences: 1,
          about: 1,
          address: 1,
        });
        console.log(tutor);
        const aiResponse = await getAnswer(
          data.mssg,
          user.username,
          tutor,
          data.extra
        );
        io.to(students[user.username]).emit("new-mssg", {
          from: data.to,
          mssg: aiResponse,
          isStudent: false,
          ai: true,
        });
        saveMessage(aiResponse, data.to, user.username, Role.Tutor, null, true);
      }
    } else if (user.role.isTutor && students[data.to]) {
      io.to(students[data.to]).emit("new-mssg", {
        from: user.username,
        mssg: data.mssg,
        isStudent: false,
        img: data.img,
      });
    }
  });
}
