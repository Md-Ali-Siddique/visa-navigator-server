const express = require("express");
const { ObjectId } = require("mongodb");

const REQUIRED_FIELDS = [
  "country_image",
  "country_name",
  "visa_type",
  "processing_time",
  "description",
  "validity",
  "application_method",
  "addedBy",
];

const cleanVisa = (body) => ({
  ...body,
  age_restriction: Number(body.age_restriction),
  fee: Number(body.fee),
  required_documents: Array.isArray(body.required_documents)
    ? body.required_documents
    : [],
});

module.exports = (getVisas) => {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const visa = cleanVisa(req.body);

    const missing = REQUIRED_FIELDS.filter((field) => !visa[field]);
    if (missing.length || !visa.required_documents.length) {
      return res.status(400).send({
        message: `Missing required fields: ${[
          ...missing,
          ...(visa.required_documents.length ? [] : ["required_documents"]),
        ].join(", ")}`,
      });
    }

    const visas = await getVisas();
    const result = await visas.insertOne({ ...visa, createdAt: new Date() });
    res.status(201).send(result);
  });

  router.get("/", async (req, res) => {
    const { type } = req.query;
    const query = type ? { visa_type: type } : {};

    const visas = await getVisas();
    const result = await visas.find(query).sort({ _id: -1 }).toArray();
    res.send(result);
  });

  router.get("/latest", async (req, res) => {
    const visas = await getVisas();
    const result = await visas.find().sort({ _id: -1 }).limit(6).toArray();
    res.send(result);
  });

  router.get("/my", async (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.status(400).send({ message: "email query is required" });
    }

    const visas = await getVisas();
    const result = await visas
      .find({ addedBy: email })
      .sort({ _id: -1 })
      .toArray();
    res.send(result);
  });

  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid visa id" });
    }

    const visas = await getVisas();
    const result = await visas.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).send({ message: "Visa not found" });
    }
    res.send(result);
  });

  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid visa id" });
    }

    const changes = cleanVisa(req.body);
    delete changes._id;
    delete changes.addedBy;
    delete changes.createdAt;

    const visas = await getVisas();
    const result = await visas.updateOne(
      { _id: new ObjectId(id) },
      { $set: changes }
    );
    res.send(result);
  });

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid visa id" });
    }

    const visas = await getVisas();
    const result = await visas.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  });

  return router;
};
