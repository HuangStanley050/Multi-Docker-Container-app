const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const keys = require("./keys");
const { Pool } = require("pg");
const redis = require("redis");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on("error", () => console.log("lost pg connection"));
pgClient
  .query("CREATE TABLE IF NOT EXISTS values(number INT)")
  .catch(err => console.log(err));

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

app.get("/", (req, res) => {
  return res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * FROM values");
  return res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    return res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const index = req.body.index;
  if (parseInt(index) > 40) {
    return res.status(422).send("value too high!!");
  }
  redisClient.hset("values", index, "nothing yet");
  redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);
  return res.send({ working: true });
});

app.listen(5000, () => console.log("server running on port 5000"));
