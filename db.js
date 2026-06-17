const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });

    db = client.db(process.env.DB_NAME);

    console.log("MongoDB Atlas Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
}

function getDB() {
  return db;
}

module.exports = {
  connectDB,
  getDB,
};