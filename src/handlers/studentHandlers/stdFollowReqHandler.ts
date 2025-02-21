import Tutor from "../../models/teacher";

type StudentRequest = {
  id: string; // teacher Id
  username: string;
  name: string;
  role: number;
};
export const handleStdFollowReq = async ({
  id,
  username,
  name,
  role,
}: StudentRequest) => {
  if (!username || role == undefined || role == null)
    return { mssg: "Unauthorized" };
  if (role.isTutor) return { mssg: "Unauthorized" };

  const updateRes = await Tutor.updateOne(
    { _id: id },
    {
      $push: {
        requests: {
          _id: username,
          name: name,
          status: "pending",
        },
      },
    }
  );
  if (updateRes.modifiedCount == 0) return { mssg: "Already Requested" };
  return { mssg: "Request sent" };
};
