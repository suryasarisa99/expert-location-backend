import { Schema, model } from "mongoose";

const ChatListSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  // studentId: {
  //   type: String,
  //   required: true,
  // },
  // teacherId: {
  //   type: String,
  //   required: true,
  // },
  messages: [
    {
      isStudent: {
        type: Boolean,
        required: true,
      },
      mssg: String,
      time: {
        type: Date,
        default: Date.now,
      },
      ai: {
        type: Boolean,
        default: false,
      },
      img: String,
      repliedMessageId: String,
    },
  ],
});

const ChatList = model("Chat", ChatListSchema);
export default ChatList;
