const request = require("request");
const dotenv = require("dotenv");
const { saveSong } = require("./firebase");
dotenv.config();

var client_id = process.env.client_id; // Your client id
var client_secret = process.env.client_secret; // Your secret

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

const getGenres = (req, res) => {
  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      // use the access token to access the Spotify Web API
      var token = body.access_token;
      var options = {
        url: "https://api.spotify.com/v1/recommendations/available-genre-seeds",
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
          (error) => reject(error);
          resolve(body.tempo);
        });
      } else {
        console.log(error);
        reject(error);
      }
    });
  });
};

const syncPlaylist = (req, res) => {
  const { playlistId, genre } = req.body;
  if (!playlistId) {
    return res.status(400).json({ error: "No playlist ID provided" });
  }

  const limit = 100;
  let offset = 0;
  let allTracks = [];

  function getPlaylistTracks() {
    console.log("getting playlist tracks");
    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        // use the access token to access the Spotify Web API
        var token = body.access_token;
        var options = {
          url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
          headers: { Authorization: "Bearer " + token },
          json: true,
        };
        request.get(options, function (error, response, body) {
          const tracks = body;
          if (tracks.items && tracks.items.length > 0) {
            tracks.items.map(async (item) => {
              const tempo = await getTrackTempo(item.track.id);

              const track = {
                tempo: tempo,
                album: item.track.album.name,
                artist: item.track.artists[0].name,
                name: item.track.name,
                uri: item.track.uri,
                image: item.track.album.images[0].url,
                songId: item.track.id,
                duration: item.track.duration_ms,
              };

              if (track.tempo) {
                allTracks.push(track);
                saveSong(track, genre)
                  .then((result) => {
                    console.log(result);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }

              if (allTracks.length === tracks.total) {
                res.json(allTracks);
              }
            });
          } else {
            res.json(allTracks);
          }
          // pagination logic
          if (tracks.items && tracks.items.length === limit) {
            offset += limit;
            getPlaylistTracks(playlistId);
          }
          // resolve(body.tempo);
        });
      } else {
        console.log(error);
        reject(error);
      }
    });
  }

  getPlaylistTracks(playlistId);

  // request.post(authOptions, function (error, response, body) {
  //   if (!error && response.statusCode === 200) {
  //     // use the access token to access the Spotify Web API
  //     var token = body.access_token;
  //     var options = {
  //       url: `https://api.spotify.com/v1/playlists/${playlistId}`,
  //       headers: {
  //         Authorization: "Bearer " + token,
  //       },
  //       json: true,
  //     };
  //     request.get(options, function (error, response, body) {

  //     });
  //   }
  // });
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

module.exports = {
  syncPlaylist,
  getUserPlaylists,
  getTrack,
  getArtist,
  getGenres,
};
