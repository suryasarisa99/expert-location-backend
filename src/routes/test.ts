import { Router } from "express";
import Tutor from "../models/teacher";
import Student from "../models/student";
import ChatList from "../models/chat";
import mongoose from "mongoose";
const router = Router();

router.get("/", (req, res) => {
  res.send("Hello Surya");
});

router.get("/indexes", async (req, res) => {
  res.json(await mongoose.connection.collection("tutors").getIndexes());
});
router.get("/reset", async (req, res) => {
  await Student.deleteMany({});
  await Tutor.deleteMany({});
  await ChatList.deleteMany({});
  res.send("Database reseted");
});
router.get("/reset-chat", async (req, res) => {
  await ChatList.deleteMany({});
  res.send("Chat reseted");
});

router.get("/create-tutor", async (req, res) => {
  const temp_tutor = {
    password: "12345",
    workExperiences: [
      {
        company: "Avengers",
        position: "Superhero",
        from: 2000,
        to: 2005,
      },
      {
        company: "Software Company",
        position: "Developer",
        from: 2000,
        to: 2005,
      },
    ],
    skills: [
      {
        name: "React",
        level: 5,
      },
      {
        name: "Node",
        level: 5,
      },
      {
        name: "Python",
        level: 4,
      },
    ],
    educations: [
      {
        institute: "MIT",
        degree: "Computer Science",
        from: 2000,
        to: 2005,
      },
      {
        institute: "Harvard",
        degree: "Math",
        from: 2000,
        to: 2005,
      },
    ],
  };

  const request = {
    _id: "surya",
    name: "Jaya Surya",
    status: "accepted",
  };
  const tutorsx = [
    {
      name: "Iron Man",
      _id: "ironman",
      email: "ironman@gmail.com",
    },
    {
      name: "Spider Man",
      _id: "spidy",
      email: "spidy@gmail.com",
      location: {
        type: "Point",
        coordinates: [82.73798, 18.563414],
      },
      // latitude: 18.563414,
      // longitude: 82.73798,
    },
    {
      name: "thor",
      _id: "thor",
      email: "thor@gmail.com",
      location: {
        type: "Point",
        coordinates: [83.084548, 17.637817],
      },
      // latitude: 17.637817,
      // longitude: 83.084548,
    },
    {
      name: "user1",
      _id: "user1",
      email: "user1@gmail.com",
      location: {
        type: "Point",
        coordinates: [82.998156, 17.709585],
      },
      // latitude: 17.709585,
      // longitude: 82.998156,
    },
    {
      name: "Hulk",
      _id: "hulk",
      email: "hulk@gmail.com",
      requests: [request],
      location: {
        type: "Point",
        coordinates: [83.013242, 17.68725],
      },
      // latitude: 17.68725,
      // longitude: 83.013242,
    },
    {
      name: "user2",
      _id: "user2",
      email: "user2@gmail.com",
    },
    {
      name: "user3",
      _id: "user3",
      email: "user3@gmail.com",
    },
    {
      name: "user4",
      _id: "user4",
      email: "user4@gmail.com",
    },
    {
      name: "user5",
      _id: "user5",
      email: "user5@gmail.com",
    },
    {
      name: "user6",
      _id: "user6",
      email: "user6@gmail.com",
    },
    {
      name: "user7",
      _id: "user7",
      email: "user7@gmail.com",
    },
    {
      name: "user8",
      _id: "user8",
      email: "user8@gmail.com",
    },
    {
      name: "user9",
      _id: "user9",
      email: "user9@gmail.com",
    },

    {
      name: "user10",
      _id: "user10",
      email: "user10@gmail.com",
    },
    {
      name: "user11",
      _id: "user11",
      email: "user11@gmail.com",
    },
    {
      name: "user12",
      _id: "user12",
      email: "user12@gmail.com",
    },
  ];

  const generatedTutors = tutorsx.map((tutor) => ({
    ...tutor,
    ...temp_tutor,
  }));

  const result = await Tutor.insertMany(generatedTutors);

  res.json({ tutor: result });
});

router.get("/create-student", async (req, res) => {
  const student = new Student({
    name: "Jaya Surya",
    _id: "surya",
    email: "suryasarisa99@gmail.com",
    password: "12345",
    // location: {
    //   type: "Point",
    //   coordinates: [83.007866, 17.69258],
    // },
  });
  await student.save();

  res.json({ student });
});

router.get("/students", async (req, res) => {
  res.json({ students: await Student.find() });
});

router.get("/tutors", async (req, res) => {
  const tutors = await Tutor.find();
  res.json(tutors);
});

router.get("/tutor/:id", async (req, res) => {
  const tutor = await Tutor.findById(req.params.id);
  res.json(tutor);
});
export default router;
