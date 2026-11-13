require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const visaRoutes = require("./routes/visaRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let dbPromise = null;
const getDb = () => {
  if (!dbPromise) {
    dbPromise = client
      .connect()
      .then(() => {
        console.log("Connected to MongoDB Atlas");
        return client.db("visaNavigatorDB");
      })
      .catch((error) => {
        dbPromise = null;
        throw error;
      });
  }
  return dbPromise;
};

const collectionGetter = (name) => async () => (await getDb()).collection(name);

app.get("/", (req, res) => {
  res.send("Visa Navigator Server is running");
});

app.use("/visas", visaRoutes(collectionGetter("visas")));
app.use("/applications", applicationRoutes(collectionGetter("applications")));

app.use((req, res) => {
  res.status(404).send({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: "Something went wrong on the server" });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
