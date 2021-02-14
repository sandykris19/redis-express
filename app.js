const { default: axios } = require("axios");
const express = require("express");
const redis = require("redis");

const app = express();
const client = redis.createClient(6379);
app.set("etag", false);

const cache = async (req, res, next) => {
  const { username } = req.params;
  client.get(username, (err, data) => {
    if (err) {
      res.send(err);
    }
    if (data != null) {
      console.log("cached data");
      res.send(`${username} has ${data} public repositories.`);
    } else {
      next();
    }
  });
};

app.get("/github/:username?", cache, async (req, res) => {
  const { username } = req.params;
  let data;
  axios
    .get(`https://api.github.com/users/${username}`)
    .then((response) => {
      data = response.data.public_repos;
      client.set(username, data);
      console.log("fetching...");
      res.send(`${username} has ${data} public repositories.`);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.listen(3000, () => {
  console.log("Listening at port 3000");
});
