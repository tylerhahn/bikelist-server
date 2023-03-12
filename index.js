const express = require("express");
const routes = require("./routes.js");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(helmet());

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "100mb" }));

app.use("/", routes);

const server = app.listen(PORT, () => {
  console.log("server is running on port", server.address().port);
});

module.exports = app;
