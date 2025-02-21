import Express, { Router } from "express";
import Jwt from "jsonwebtoken";
import cookie from "cookie";
import Student from "../models/student";
import Tutor from "../models/teacher";
import errors from "../errorMessages";
import { io, students, teachers } from "../server";
import { Handshake } from "socket.io/dist/socket";
import { IncomingHttpHeaders } from "http";
import { Role } from "../types";

const router = Router();

export interface AuthRequest extends Express.Request {
  username: string;
  role: number;
  name: string;
}

// export const authenticateForSocketIO = async (headers: IncomingHttpHeaders) => {
//   let cookies = headers.cookie;
//   console.log(headers);
//   if (cookies == null && headers.authorization) {
//     cookies = "token=" + headers.authorization;
//   }
//   console.log("cookie or  bearer: ", cookies);
//   try {
//     if (!cookies) return;
//     const parsedCookies = cookie.parse(cookies);
//     const token = parsedCookies.token;
//     if (token) {
//       console.log(`token: ${token}`);
//       const status = Jwt.verify(token, process.env.JWT_SECRET);
//       if (typeof status !== "string") {
//         return {
//           username: status?.username,
//           role: status.role,
//           name: status.name,
//         };
//       }
//     } else {
//     }
//   } catch (e) {
//     console.log("some error");
//     console.log(e);
//     // res.status(401).send("Unauthorized");
//   }
// };

export const authenticateForSocketIO = async (headers: IncomingHttpHeaders) => {
  let token: string;
  // console.log("headers 1: ", headers);
  if (headers.authorization) {
    token = headers.authorization.replace("Bearer ", "");
    console.log("authorization 1: ", token);
  }
  // if (!token && headers.cookie) {
  //   token = cookie.parse(headers.cookie).token;
  //   console.log("cookie 1: ", token);
  // }
  if (!token) {
    console.log("socket: token is empty or null");
    return;
  }
  try {
    console.log(`token: ${token}`);
    const status = Jwt.verify(token, process.env.JWT_SECRET);
    if (typeof status !== "string") {
      return {
        username: status?.username,
        role: status.role,
        name: status.name,
        token: token,
      };
    }
  } catch (e) {
    console.log("some error");
    console.log(e);
    // res.status(401).send("Unauthorized");
  }
};

export const authenticate = async (
  req: AuthRequest,
  res: Express.Response,
  next: Express.NextFunction
) => {
  try {
    let token: string;
    // console.log("headers 2: ", req.headers);

    if (req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
      console.log("authorization 2: ", token);
    }
    // if (!token && req.headers.cookie) {
    //   token = cookie.parse(req.headers.cookie).token;
    //   console.log("cookie 2: ", token);
    // }

    if (!token) {
      console.log("token is empty or null");
      return res.status(401).send("Unauthorized");
    }
    const status = Jwt.verify(token, process.env.JWT_SECRET);
    if (typeof status !== "string") {
      req.username = status?.username;
      req.role = status.role;
      req.name = status.name;
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(401).send("Unauthorized");
  }
};

async function getStudents(
  studentsIdWithStatus: {
    _id: string;
    status: string;
  }[]
) {
  const studentIds = studentsIdWithStatus.map((student) => student._id);
  const studentsData = await Student.find(
    {
      _id: { $in: studentIds },
    },
    {
      name: 1,
      _id: 1,
      img: 1,
    }
  );
  const onlineStudents = Object.keys(students);
  const studentsDataWithStatus = studentsData.map((student) => {
    const status = studentsIdWithStatus.find(
      (std) => std._id == student._id
    )?.status;
    return {
      ...student.toObject(),
      status,
      isOnline: onlineStudents.includes(student._id),
    };
  });
  return studentsDataWithStatus;
}

async function getStudentTutors(
  id: String,
  latitude?: Number,
  longitude?: Number
) {
  const pipeline: any[] = [];
  console.log("latitude", latitude, "longitude", longitude);

  // First get all tutors as before
  pipeline.push(
    {
      $match: {},
    },
    {
      $project: {
        id: 1,
        name: 1,
        img: 1,
        skills: 1,
        location: 1, // Include location for distance calculation
        status: {
          $let: {
            vars: {
              firstMatchingRequest: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$requests",
                      as: "request",
                      cond: { $eq: ["$$request._id", id] },
                    },
                  },
                  0,
                ],
              },
            },
            in: "$$firstMatchingRequest.status",
          },
        },
      },
    }
  );

  const tutors = await Tutor.aggregate(pipeline);
  const onlineTutors = Object.keys(teachers);

  return tutors.map((tutor) => {
    // Calculate distance only if both tutor and student have locations
    let distance = null;
    if (
      latitude &&
      longitude &&
      tutor.location?.coordinates?.[0] !== undefined &&
      tutor.location?.coordinates?.[1] !== undefined
    ) {
      // Haversine formula for accurate Earth distance
      const R = 6371; // Earth's radius in kilometers
      const lat1 = ((latitude as number) * Math.PI) / 180;
      const lat2 = (tutor.location.coordinates[1] * Math.PI) / 180;
      const deltaLat =
        ((tutor.location.coordinates[1] - Number(latitude)) * Math.PI) / 180;
      const deltaLon =
        ((tutor.location.coordinates[0] - Number(longitude)) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(deltaLon / 2) *
          Math.sin(deltaLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = Math.round(R * c * 100) / 100; // Round to 2 decimal places
    }

    return {
      ...tutor,
      isOnline: onlineTutors.includes(tutor._id),
      distance, // Will be null if no location data available
    };
  });
}

router.post("/signup", async (req, res) => {
  return res.json({ mssg: "Signup" });
});

router.post("/signin", async (req, res) => {
  const { role, username, password } = req.body;

  if (role.isStudent) {
    const std = await Student.findById(username);
    if (!std) return res.status(401).json(errors.usernameError);
    if (std.password !== password)
      return res.status(401).json(errors.passwordError);

    const token = Jwt.sign(
      {
        role,
        username: username,
        name: std.name,
      },
      process.env.JWT_SECRET
    );

    // res.cookie("token", token, {
    //   secure: false,
    //   httpOnly: true,
    //   sameSite: "lax",
    // });
    const coord = std.location?.coordinates;
    const tutors = await getStudentTutors(username, coord?.[1], coord?.[0]);
    // const tutors = await getStudentTutors(username, std.location.coordinates);
    io.emit("online-satus", {
      id: username,
      role: Role.Student,
      status: true,
    });

    return res.json({
      loggedIn: true,
      student: std,
      role: Role.Student,
      tutors,
      token: token,
    });
  } else if (role.isTutor) {
    const teacher = await Tutor.findById(username);
    if (!teacher) return res.status(401).json(errors.usernameError);
    if (teacher.password !== password)
      return res.status(401).json(errors.passwordError);

    const studentUsers = await getStudents(
      teacher.requests as {
        _id: string;
        status: string;
      }[]
    );
    const teacherObj = teacher.toObject();
    delete teacherObj.requests;
    delete teacherObj.password;

    const token = Jwt.sign(
      {
        role,
        username: username,
        name: teacher.name,
      },
      process.env.JWT_SECRET
    );
    // res.cookie("token", token, {
    //   secure: false,
    //   httpOnly: true,
    //   sameSite: "lax",
    // });
    io.emit("online-status", {
      id: username,
      status: true,
      role: Role.Tutor,
    });
    return res.json({
      tutor: teacherObj,
      students: studentUsers,
      loggedIn: true,
      role: Role.Tutor,
      token: token,
    });
  } else {
    return res.status(401).json({ mssg: "Invalid Role" });
  }
});

router.get("/check-cookie", authenticate, async (req: AuthRequest, res) => {
  console.log("cookie is there", req.username);
  return res.json({ loggedIn: true, role: req.role });
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  const username = req.username;
  const role = req.role;
  if (!username || role == undefined || role == null)
    return res.status(401).send("Unauthorized");
  if (role.isStudent) {
    const student = await Student.findById(username);
    if (!student) return res.status(401).send("Unauthorized");

    const coord = student.location?.coordinates;
    const tutors = await getStudentTutors(username, coord?.[1], coord?.[0]);
    io.emit("online-status", {
      id: username,
      role: Role.Student,
      status: true,
    });
    return res.json({ student, tutors, loggedIn: true, role: 1 });
  } else if (role.isTutor) {
    const teacher = await Tutor.findById(username);
    io.emit("online-status", {
      id: username,
      role: Role.Tutor,
      status: true,
    });
    const studentUsers = await getStudents(
      teacher.requests as { _id: string; status: string }[]
    );
    const teacherObj = teacher.toObject();
    delete teacherObj.requests;
    delete teacherObj.password;
    return res.json({
      tutor: teacherObj,
      students: studentUsers,
      loggedIn: true,
      role: Role.Tutor,
    });
  } else {
    return res.status(401).json({ mssg: "Invalid Role" });
  }
});

export default router;

// {
//   $project: {
//     matchedObject: {
//       $filter: {
//         input: "$requests",
//         cond: {
//           $eq: ["$$this._id", idToMatch]
//         }
//       }
//     }
//   }
// },
// {
//   $project: {
//     matchedObject: {
//       $arrayElemAt: ["$matchedObject", 0]
//     }
//   }
// }

// [
//   {
//     $match: {
//       "requests._id": "your_id_here"
//     }
//   },
//   {
//     $unwind: "$requests"
//   },
//   {
//     $match: {
//       "requests._id": "your_id_here"
//     }
//   },
//   {
//     $replaceRoot: {
//       newRoot: {
//         status: "$requests.status"
//       }
//     }
//   }
// ]
