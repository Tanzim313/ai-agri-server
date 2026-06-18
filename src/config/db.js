const { MongoClient, ServerApiVersion } = require("mongodb");

let client;
let db;

const getDatabaseName = () => process.env.DB_NAME || process.env.MONGO_DB_NAME || "smart_agriculture";

const connectDB = async () => {
  if (db) {
    return db;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    },
    maxPoolSize: 20
  });

  await client.connect();
  db = client.db(getDatabaseName());

  await db.command({ ping: 1 });
  await createIndexes();

  console.log(`MongoDB connected: ${getDatabaseName()}`);
  return db;
};

const createIndexes = async () => {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("disease_records").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("soil_records").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("weather_records").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("crop_recommendations").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("irrigation_recommendations").createIndex({ userId: 1, createdAt: -1 })
  ]);
};

const getDB = () => {
  if (!db) {
    throw new Error("Database not connected. Call connectDB first.");
  }

  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
};

module.exports = {
  connectDB,
  getDB,
  closeDB
};
