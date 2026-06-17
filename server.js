require("dotenv").config();

const express = require("express");
const { connectDB, getDB } = require("./src/config/db");

const app = express();

app.use(express.json());

async function startServer() {
  await connectDB();

  const db = getDB();
  const userCollection = db.collection("user");



  app.get("/users", async (req, res) => {
  const db = getDB();

  const users = await userCollection
    .find({})
    .toArray();

  res.send(users);
 });



  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Server Running",
    });
  });


  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
}

startServer();