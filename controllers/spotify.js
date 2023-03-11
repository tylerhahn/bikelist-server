import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

const searchForTrack = (req, res) => {
  const { query } = req.body;

  let searchResults = [];
  spotifyApi.searchTracks(query).then((data) => {
    searchResults.push(data.body.tracks.items);

    res.json(searchResults);
  });
};

export default {
  searchForTrack,
};
