import jwt from "jsonwebtoken"
import express, { json } from "express"
import bcrypt from "bcrypt"
import cors from "cors"
import { PrismaClient } from "./generated/prisma/client.ts"
import dotenv from "dotenv";
import { authenticate } from "./middleware/auth.js"
import axios from "axios"

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post("/api/signup", async (req,res)=>{
    try{
        // take data from body
        const {name , email , password} = req.body;

        // check if all the fields are filled or not
        if(!name || !email || !password){
            res.status(401).json({
                message:"All the fields are required"
            });
        }

        // check if user exists or not
        const ExistingUser = await prisma.user.findUnique({where:{email}});
        if(ExistingUser){
            res.status(409).json({
                message: "User already registered"
            });
        }

        // hash the password
        const hashPassword = await bcrypt.hash(password,10);

        // create user
        const user = await prisma.user.create({
            data: {name,email,password:hashPassword}
        });

        const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "backupsecret",
      { expiresIn: "7d" }
    );

        res.status(200).json({
            message: "User created",
            token,
            user
        })
    }catch(err){
        res.json({
            error:err.message
        });
    }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // 4. Send response
    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

const SPOTIFY_API_KEY = 'f4e218c6bcmshc2360d8f6e46b82p15386ajsn2968d88e6eb8'
const YOUTUBE_KEY = 'AIzaSyAF6oLkEGmVLD-tZeMSd4O_oQp2XRRgYOM'

app.get("/api/search" , async (req,res)=>{
  const {q} = req.query;
    try{  
      const response = await axios.get("https://spotify23.p.rapidapi.com/search/", {
        params: {q , type: "tracks"},
        headers: {
          "X-RapidAPI-Key": SPOTIFY_API_KEY,
          "X-RapidAPI-Host": "spotify23.p.rapidapi.com",
        },  
      });
      res.json(response.data.tracks.items[0].data);

    }catch(err){
      console.log(err);
      res.status(500).json({error : err.message});
    }
});

app.get("/api/playback" , async (req,res)=>{
  const {q} = req.query;
  try{
    const ytResponse = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {part: "snippet" , q, key: YOUTUBE_KEY , maxResults: 1, type: "video"},
    });
    res.json({videoId: ytResponse.data.items[0].id.videoId});
  }catch(err){
    console.log(err);
    res.status(500).json({error : err.message});
  }
});

app.post("/api/favourites", async (req, res) => {
  try {
    const { userId, videoId, title, channel, thumbnail } = req.body;
    // console.log("Incoming favourites request:", req.body);

    if (!userId || !videoId) {
      return res.status(400).json({ error: "userId and videoId are required" });
    }

    const fav = await prisma.favourite.create({
      data: {
        videoId,
        title,
        channel,
        thumbnail,
        user: { connect: { id: Number(userId) } }, // 👈 connect by userId
      },
    });

    res.json(fav);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
});


app.delete("/api/favourites/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId } = req.body;
    // console.log(userId);

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await prisma.favourite.deleteMany({
      where: { videoId, userId : Number(userId)},
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
});

app.get("/api/favourites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const favs = await prisma.favourite.findMany({
      where: { userId: Number(userId) },
    });

    res.json(favs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});