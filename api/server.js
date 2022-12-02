const express = require("express");
const { v4: uuidv4 } = require("uuid");
const redis = require("redis");
const { expressjwt: jwt } = require("express-jwt");
const jwtwt = require("jsonwebtoken");
const e = require("express");
const app = express();
const port = process.env.PORT || 2000;

const cacheHostName = "pwc-redis.redis.cache.windows.net";
const cachePassword = "5aicPkdhW950HQ30g9ZmWyA9jQUsHdm42AzCaHJyXLg=";

let redisClient;

(async () => {
  redisClient = redis.createClient({
    url: "rediss://" + cacheHostName + ":6380",
    password: cachePassword,
  });

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

app.use(
  jwt({
    secret: "shhhhhhared-secret",
    algorithms: ["HS256"],
    getToken: (req) => {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        return req.headers.authorization.split(" ")[1];
      }
    },
  }).unless({ path: ["/register"] })
);

app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "invalid token..." });
  } else {
    next(err);
  }
});

app.get("/register", (req, res) => {
  const token = jwtwt.sign(
    { name: "shlomi", surname: "oliel", id: uuidv4() },
    "shhhhhhared-secret"
  );

  res.json({ token: token });
});

app.get("/initialize", async (req, res) => {
  const max = 10000;
  const min = 1;
  const random = Math.floor(Math.random() * (max - min + 1) + min);
  const play = { uid: uuidv4(), random };

  await redisClient.set(play.uid, JSON.stringify(random));

  res.json(play);
});

app.get("/guess/:uid/:number", async (req, res) => {
  const number = parseInt(req.params.number);
  const uid = req.params.uid;
  const random = await redisClient.get(uid);
  let message = "Whats going on " + number;

  if (random) {
    const randomNumber = parseInt(random);
    if (randomNumber === number) {
      await redisClient.del(uid);
      message = `What a legend you guessed it ${number}!!!`;
    } else if (random > number) {
      message = `Your number ${number} is smaller`;
    } else if (random < number) {
      message = `Your number ${number} is bigger`;
    }
  } else {
    message = "Start new game!";
  }
  res.json({ message });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
