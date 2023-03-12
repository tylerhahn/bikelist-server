const admin = require("firebase-admin");
const serviceAccount = require("./bikelist-81cbf-firebase-adminsdk-rifp5-7c05e21a0b.json");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bikelist-81cbf.firebaseio.com",
  storageBucket: "bikelist-81cbf.appspot.com",
});

module.exports = app;
