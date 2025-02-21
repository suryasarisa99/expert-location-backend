import ChatList from "../models/chat";

export async function saveMessage(
  mssg: string,
  username: string,
  to: string,
  role: number,
  img?: string,
  ai: boolean = false
) {
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
          ai: ai,
        },
      },
    },
    {
      upsert: true,
    }
  );
  console.log({
    isStudent: role.isStudent,
    mssg,
    img,
  });
  console.log(updateStatus);
}
