const app = require("../firebase/firebase");

const generatePlaylist = async (req, res) => {
  const { difficulty, duration, type, genre } = req.body;

  if (!difficulty || !duration || !type || !genre) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const songCollection = app.firestore().collection(genre);

  let totalDuration = 0;
  let generating = true;
  const selectedSongs = [];

  while (generating) {
    const randomIndex = Math.floor(Math.random() * 100); // assuming you have 100 songs in the collection
    const querySnapshot = await songCollection
      .limit(1)
      .offset(randomIndex)
      .get();
    const song = querySnapshot.docs[0].data();

    console.log("totalDuration", totalDuration);
    console.log("song.duration", song.duration);

    if (totalDuration + song.duration <= duration * 60000) {
      selectedSongs.push(song);
      totalDuration += song.duration;
    } else {
      generating = false;
    }
  }
  res.json({ duration: totalDuration, songs: selectedSongs });
};

const getAllSongs = (genre) => {
  return new Promise((resolve, reject) => {
    if (!genre) {
      reject("No genre provided");
    }

    if (!genre) {
      return res.status(400).json({ error: "No genre provided" });
    }

    const col = app.firestore().collection(genre);

    col
      .get()
      .then((querySnapshot) => {
        const songs = [];
        querySnapshot.forEach((doc) => {
          songs.push(doc.data());
        });
        console.log(songs.length);
        resolve(songs);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

const saveSong = (song, genre) => {
  console.log(song.songId);
  return new Promise((resolve, reject) => {
    if (!song || !genre) {
      reject("No song provided");
    }

    console.log(song);

    const firestoreCollection = app.firestore().collection(genre);

    firestoreCollection
      .where("songId", "==", song.songId)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          firestoreCollection
            .add(song)
            .then((docRef) => {
              resolve(docRef.id);
            })
            .catch((error) => {
              console.log(error);
              reject(error);
            });
          console.log("No document found with song ID:", song.songId);
        } else {
          reject("Song already exists in database");
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports = {
  saveSong,
  generatePlaylist,
  getAllSongs,
};
