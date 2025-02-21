import { model, Schema } from "mongoose";

const PostSchema = new Schema({
  caption: String,
  url: String,
  filename: String,
  size: String,
  ext: String,
  type: String,
  username: String,
  name: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const Post = model("Post", PostSchema);

export default Post;
