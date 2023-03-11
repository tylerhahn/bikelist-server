import request from "request";

var client_id = "d1c0f316548b465cacd04c6bfb739729"; // Your client id
var client_secret = "11759af065db4c63bcb439ea3bcf7752"; // Your secret

// Allocate memory for the encoded client ID and secret
const encoded = Buffer.alloc(client_id.length + client_secret.length + 1);

// Concatenate the client ID and secret with a colon separator
const credentials = client_id + ":" + client_secret;

// Encode the credentials as a base64 string and store in the buffer
encoded.write(credentials, 0);

const auth = encoded.toString("base64");

var authOptions = {
  url: "https://accounts.spotify.com/api/token",
  headers: {
    Authorization: "Basic " + auth,
  },
  form: {
    grant_type: "client_credentials",
  },
  json: true,
};

const getUserPlaylists = (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "No user ID provided" });
  }

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: `https://api.spotify.com/v1/users/${userId}/playlists`,
        headers: {
          Authorization: "Bearer " + token,
        },
        json: true,
      };
      request.get(options, function (error, response, body) {
        res.json(body);
      });
    }
  });
};

const getTrackTempo = (trackId) => {
  return new Promise((resolve, reject) => {
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // use the access token to access the Spotify Web API
        var token = body.access_token;
        var options = {
          url: `https://api.spotify.com/v1/audio-features/${trackId}`,
          headers: { Authorization: "Bearer " + token },
          json: true,
        };
        request.get(options, function (error, response, body) {
          resolve(body.tempo);
        });
      } else {
        reject(error);
      }
    });
  });
};

const getMainPlaylist = (req, res) => {
  const { playlistId } = req.body;
  if (!playlistId) {
    return res.status(400).json({ error: "No playlist ID provided" });
  }

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: `https://api.spotify.com/v1/playlists/${playlistId}`,
        headers: {
          Authorization: "Bearer " + token,
        },
        json: true,
      };
      request.get(options, function (error, response, body) {
        let allTracks = [];
        body.tracks.items.map(async (item) => {
          const genres = await getArtist(item.track.artists[0].id);
          const tempo = await getTrackTempo(item.track.id);

          const track = {
            tempo: tempo,
            genres: genres,
            album: item.track.album.name,
            artist: item.track.artists[0].name,
            name: item.track.name,
            uri: item.track.uri,
            image: item.track.album.images[0].url,
            id: item.track.id,
          };
          allTracks.push(track);

          if (allTracks.length === body.tracks.items.length - 1)
            res.json(allTracks);
        });
      });
    }
  });
};

const getArtist = (artistId) => {
  return new Promise((resolve, reject) => {
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // use the access token to access the Spotify Web API
        var token = body.access_token;
        var options = {
          url: `https://api.spotify.com/v1/artists/${artistId}`,
          headers: {
            Authorization: "Bearer " + token,
          },
          json: true,
        };
        request.get(options, function (error, response, body) {
          resolve(body.genres);
        });
      } else {
        reject(error);
      }
    });
  });
};

const getTrack = (req, res) => {
  const { trackId } = req.params;
  if (!trackId) {
    return res.status(400).json({ error: "No track ID provided" });
  }

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: `https://api.spotify.com/v1/tracks/${trackId}`,
        headers: {
          Authorization: "Bearer " + token,
        },
        json: true,
      };
      request.get(options, function (error, response, body) {
        res.json(body);
      });
    }
  });
};

export default {
  getMainPlaylist,
  getUserPlaylists,
  getTrack,
  getArtist,
};
