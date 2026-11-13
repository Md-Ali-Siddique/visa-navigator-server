const express = require("express");
const { ObjectId } = require("mongodb");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = (getApplications) => {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const application = req.body;

    if (!application.email || !application.visaId) {
      return res
        .status(400)
        .send({ message: "email and visaId are required" });
    }

    const applications = await getApplications();

    const existing = await applications.findOne({
      email: application.email,
      visaId: application.visaId,
    });
    if (existing) {
      return res
        .status(409)
        .send({ message: "You have already applied for this visa" });
    }

    const result = await applications.insertOne({
      ...application,
      fee: Number(application.fee),
      createdAt: new Date(),
    });
    res.status(201).send(result);
  });

  router.get("/", async (req, res) => {
    const { email, country } = req.query;
    if (!email) {
      return res.status(400).send({ message: "email query is required" });
    }

    const query = { email };
    if (country) {
      query.country_name = { $regex: escapeRegex(country), $options: "i" };
    }

    const applications = await getApplications();
    const result = await applications.find(query).sort({ _id: -1 }).toArray();
    res.send(result);
  });

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid application id" });
    }

    const applications = await getApplications();
    const result = await applications.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  });

  return router;
};
