import { Router } from "express";
import { authenticate, AuthRequest } from "./auth";
import Post from "../models/postSchema";

const router = Router();

router.post("/upload", authenticate, async (req: AuthRequest, res) => {
  const { username, name } = req;

  const { caption, url, ext, type, size, filename } = req.body;
  console.log(req.body);
  if (!caption || !url || !ext || !filename) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const post = new Post({
    caption,
    url,
    ext,
    type,
    size,
    filename,
    username,
    name,
  });
  await post.save();

  res.status(201).json({ message: "Post uploaded" });
});

router.get("/", authenticate, async (req: AuthRequest, res) => {
  const posts = await Post.find().sort({ date: -1 });
  res.json({ posts });
});

export default router;
