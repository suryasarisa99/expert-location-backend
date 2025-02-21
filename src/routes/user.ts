import { Router } from "express";
import ChatList from "../models/chat";
import { authenticate, AuthRequest } from "./auth";
import Tutor from "../models/teacher";
import Student from "../models/student";
import { handleTutorRequest } from "../handlers/tutorHandlers/tutorAcceptHandlers";
import { handleStdFollowReq } from "../handlers/studentHandlers/stdFollowReqHandler";
const router = Router();

router.get("/mssgs/:recId", authenticate, async (req: AuthRequest, res) => {
  const username = req.username;
  const role = req.role;
  const recId = req.params.recId;

  let chatId = "";
  if (role.isStudent) {
    chatId = `${username}-${req.params.recId}`;
  } else if (role.isTutor) {
    chatId = `${req.params.recId}-${username}`;
  }

  const chat = await ChatList.findById(chatId);
  if (!chat) {
    return res.json({ messages: [] });
  } else {
    return res.json({ messages: chat.messages });
  }
});

router.post("/mssg", authenticate, async (req: AuthRequest, res) => {
  const { to, mssg, img } = req.body;
  const role = req.role;
  const username = req.username;
  let chatId: string = "";
  if (role.isStudent) {
    chatId = `${username}-${to}`;
  } else if (role.isTutor) {
    chatId = `${to}-${username}`;
  }

  const updateStatus = await ChatList.updateOne(
    { _id: chatId },
    {
      $push: {
        messages: {
          isStudent: role.isStudent,
          mssg,
          img,
        },
      },
    },
    {
      upsert: true,
    }
  );
  console.log(updateStatus);

  return res.json({ mssg: "Message sent" });
});

router.get("/tutor/:id", async (req, res) => {
  const tutor = await Tutor.findById(req.params.id, {
    name: 1,
    email: 1,
    skills: 1,
    educations: 1,
    workExperiences: 1,
    location: 1,
  });
  return res.json(tutor);
});

router.get("/follow/:id", authenticate, async (req: AuthRequest, res) => {
  const result = await handleStdFollowReq({
    id: req.params.id,
    username: req.username,
    name: req.name,
    role: req.role,
  });
  return res.json(result);
});

router.post(
  "/accept/:id/:status",
  authenticate,
  async (req: AuthRequest, res) => {
    const result = await handleTutorRequest({
      id: req.params.id,
      teacherUsername: req.username,
      teacherName: req.name,
      status: req.params.status,
      studentName: req.body.studentName,
      role: req.role,
    });
    return res.json(result);
  }
);

router.post("/profile/upload", authenticate, async (req: AuthRequest, res) => {
  const { username, role } = req;
  const { url } = req.body;
  if (role.isStudent) {
    await Student.updateOne({ _id: username }, { $set: { img: url } });
  } else if (role.isTutor) {
    await Tutor.updateOne({ _id: username }, { $set: { img: url } });
  } else {
    return res.status(401).json({ mssg: "Unauthorized" });
  }
  res.status(201).json({ message: "Profile Pic uploaded" });
});

router.post("/location-update", authenticate, async (req: AuthRequest, res) => {
  const { username, role } = req;
  const { location } = req.body;
  console.log(`update location: ${location}`);
  await (role.isTutor ? Tutor : Student).updateMany(
    {
      _id: username,
    },
    [
      {
        $set: {
          location: {
            type: "Point",
            coordinates: location,
          },
        },
      },
    ]
  );
});

export default router;
