import express from "express";
import spotify from "./controllers/spotify.js";
const router = express.Router();

router.post("/spotify/search", spotify.searchForTrack);

export default router;
