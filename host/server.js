const express = require("express");
const { request } = require("./utils/request");
var cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 1000;
const API_URL = "https://guessapi.azurewebsites.net";

app.use(cookieParser());

app.get(`/register`, (req, res) => {
  request(`${API_URL}/register`, { METHOD: "POST" })
    .then((results) => {
      if (results.token) {
        res.cookie("token", results.token);
        res.json(results);
      } else {
        res.json({ error: "Error register user" });
      }
    })
    .catch((e) => {
      console.log(e);
    });
});

app.get(`/start`, (req, res) => {
  request(`${API_URL}/initialize`, { METHOD: "GET" }, req.cookies.token)
    .then((results) => {
      res.cookie("uid", results.uid);
      res.json(results);
    })
    .catch((e) => {
      console.log(e);
    });
});

app.get(`/guess/:number`, (req, res) => {
  const number = req.params.number;
  const uid = req.cookies.uid;

  request(
    `${API_URL}/guess/${uid}/${number}`,
    { METHOD: "GET" },
    req.cookies.token
  )
    .then((results) => {
      res.json(results);
    })
    .catch((e) => {
      console.log(e);
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
