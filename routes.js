const express = require("express");
const spotify = require("./controllers/spotify.js");
const router = express.Router();

router.post("/spotify/user/", spotify.getUserPlaylists);
router.post("/spotify/collection/", spotify.getMainPlaylist);
router.get("/spotify/track/:trackId", spotify.getTrack);
router.get("/spotify/artist/:artistId", spotify.getArtist);

export default router;
