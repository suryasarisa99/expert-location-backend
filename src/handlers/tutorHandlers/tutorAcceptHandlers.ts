import Student from "../../models/student";
import Tutor from "../../models/teacher";

type TutorRequest = {
  id: string; // student Id
  teacherUsername: string;
  teacherName: string;
  status: string;
  studentName: string;
  role: number;
};
export const handleTutorRequest = async ({
  id,
  teacherUsername,
  teacherName,
  status,
  studentName,
  role,
}: TutorRequest) => {
  if (!teacherUsername || role == undefined || role == null)
    return { mssg: "Unauthorized" };
  if (role.isStudent) return { mssg: "Unauthorized" };

  await Tutor.updateOne(
    { _id: teacherUsername, "requests._id": id },
    {
      $set: {
        "requests.$.status": status,
      },
    }
  );

  return { mssg: "Request sent" };
};
