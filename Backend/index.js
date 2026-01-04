import jwt from "jsonwebtoken";
import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/client.ts";
import dotenv from "dotenv";
import axios from "axios";
import { connect } from "node:http2";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ---------------- AUTH ----------------

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashPassword },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "backupsecret",
      { expiresIn: "7d" }
    );

    res.status(201).json({ message: "User created", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "backupsecret",
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ---------------- SPOTIFY + YOUTUBE ----------------

const SPOTIFY_API_KEY = process.env.SPOTIFY_API_KEY;
const YOUTUBE_KEY = process.env.YOUTUBE_KEY;

// Search Spotify tracks
app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get("https://spotify23.p.rapidapi.com/search/", {
      params: { q, type: "tracks" },
      headers: {
        "X-RapidAPI-Key": SPOTIFY_API_KEY,
        "X-RapidAPI-Host": "spotify23.p.rapidapi.com",
      },
    });
    res.json(response.data.tracks.items[0].data);
  } catch (err) {
    console.error(err);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// Playback via YouTube (returns full URL)
app.get("/api/playback", async (req, res) => {
  const { q } = req.query;
  try {
    const ytResponse = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: { part: "snippet", q, key: YOUTUBE_KEY, maxResults: 1, type: "video" },
    });

    const videoId = ytResponse.data.items[0].id.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    res.json({ videoId, videoUrl });
  } catch (err) {
    console.error(err);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ---------------- PLAYLISTS ----------------

// Create playlist
app.post("/api/playlist", async (req, res) => {
  const { name, userId } = req.body;
  try {
    const playlist = await prisma.playlists.create({ data: { name, userId } });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a Playlist
app.delete("/api/deleteplaylist", async(req,res)=>{
  const {id} = req.body;
  try{
    await prisma.playlists.delete({where: {id}});
    res.status(200).json({message: "Playlist Deleted"});
  }catch(err){
    res.status(500).json({error: err.message});
  }
});

// Get all playlists
app.get("/api/getplaylists", async (req, res) => {
  try {
    const playlists = await prisma.playlists.findMany({
      include: { tracks: { include: { track: true } } },
    });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single playlist
app.get("/api/playlist/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const playlist = await prisma.playlists.findUnique({
      where: { id: Number(id) },
      include: { tracks: { include: { track: true } } },
    });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add track to playlist
app.post("/api/playlists/:id/tracks", async (req, res) => {
  const { id } = req.params;
  const { trackId, order } = req.body;
  try {
    const playlistTrack = await prisma.playlistTrack.create({
      data: { playlistId: Number(id), trackId: Number(trackId), order },
    });
    res.json(playlistTrack);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- TRACKS ----------------

// Add a track using Spotify metadata but store YouTube URL
// Add a track using metadata from /api/search and store YouTube URL
app.post("/api/tracks", async (req, res) => {
  const { title, artist, duration, coverUrl } = req.body;

  try {
    // 1. Search YouTube for the track
    const ytResponse = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: `${title} ${artist}`,
        key: YOUTUBE_KEY,
        maxResults: 1,
        type: "video",
      },
    });

    const videoId = ytResponse.data.items[0].id.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // 2. Insert into Prisma Track table with YouTube URL
    const track = await prisma.track.create({
      data: {
        title,
        artist,
        duration: Math.floor(duration / 1000), // convert ms → sec
        url: videoUrl,
        coverUrl,
      },
    });

    res.json(track);
  } catch (err) {
    console.error(err);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// ---------------- FAVOURITES ----------------

// Create Favourite
app.post("/api/createFavourite" , async (req,res)=>{
  const { userId } = req.body;
  try{
    const Fav = await prisma.favourite.create({data:{userId}});
    res.json(Fav);
  }catch(err){
    console.error("error: " , err);
  }
});

// Add Track To Favourite
app.post("/api/favourites/:id/track" , async(req,res)=>{
    // const {Favouriteid} = req.params;
    const { trackId, order,userId , Favouriteid} = req.body;
  try{
    const FavTrack = await prisma.favouriteTrack.create({data:{Favourite:{connect:{id:Number(Favouriteid)}} ,User:{connect:{id:Number(userId)}} ,track:{connect:{id:Number(trackId)}} , order}});
    res.json(FavTrack);
  }catch(err){
    console.error("error: " , err);
  }
})

// get favourite list
app.get("/api/favourite/:id",async(req,res)=>{
  const {id} = req.params;
  try{
    const favourite = await prisma.favourite.findUnique({
      where:{id : Number(id)},
      include:{tracks:{include:{track:true}}}
    });
    res.json(favourite);
  }catch(err){
    console.log(err);
  }
});

// Get all tracks
app.get("/api/alltracks",async(req,res)=>{
  try{
    const alltracks = await prisma.track.findMany();
    res.json(alltracks);
  }catch(err){
    console.log(err);
  }
});

// Get specific track
app.get("/api/specificTrack",async(req,res)=>{
  const {SongId} = req.body;
  try{
    const specificTrack = await prisma.track.findUnique({
      where:{id:SongId}
    })
    res.json(specificTrack);
  }catch(err){
    console.log(err);
  }
})

// Get all favourite
app.get("/api/getfavourite", async (req, res) => {
  try {
    const favourite = await prisma.favourite.findMany({
      include:{user:{include:{FavouriteTracks:true}}}
    })
    res.json(favourite);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove specific Track from Favourites
app.delete("/api/favourites/:id/track/:trackId",async(req,res)=>{
  const {Favouriteid , trackId} = req.params;
  try{
    await prisma.favouriteTrack.delete({
      where:{trackId:Number(trackId) , Favouriteid:Favouriteid}
    });
    res.json("Deleted The Track");
  }catch(err){
    console.log(err);
  }
});

// ---------------- SERVER ----------------

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});