const express = require("express");
const spotify = require("./controllers/spotify.js");
const router = express.Router();
const firebase = require("./controllers/firebase.js");

router.post("/spotify/user/", spotify.getUserPlaylists);
router.post("/spotify/collection/", spotify.syncPlaylist);
router.get("/spotify/track/:trackId", spotify.getTrack);
router.get("/spotify/artist/:artistId", spotify.getArtist);
router.get("/spotify/genres", spotify.getGenres);

router.post("/songs/add", firebase.saveSong);
router.get("/songs/get/:genre", firebase.getAllSongs);

router.post("/ride/generate", firebase.generatePlaylist);

module.exports = router;
