require("dotenv").config();
const { MongoClient } = require("mongodb");

const img = (name) => `/images/countries/${name}.jpg`;

const docs = {
  basic: ["Valid passport", "Visa application form", "Recent passport-sized photograph"],
  travel: ["Valid passport", "Visa application form", "Recent passport-sized photograph", "Bank statement", "Travel itinerary"],
  study: ["Valid passport", "Visa application form", "Recent passport-sized photograph", "Bank statement", "Invitation letter"],
  work: ["Valid passport", "Visa application form", "Recent passport-sized photograph", "Employment letter", "Invitation letter"],
};

const owner = "seed@visanavigator.app";

const visas = [
  { country_name: "Japan", country_image: img("japan"), visa_type: "Tourist visa", processing_time: "5-7 working days", required_documents: docs.travel, description: "Short-stay visa for sightseeing, family visits and cultural trips. You need a confirmed itinerary and proof you can fund your stay.", age_restriction: 0, fee: 30, validity: "90 days", application_method: "Online" },
  { country_name: "Canada", country_image: img("canada"), visa_type: "Student visa", processing_time: "4-6 weeks", required_documents: docs.study, description: "Study permit for full-time programs at designated learning institutions. A letter of acceptance is required before you apply.", age_restriction: 18, fee: 150, validity: "Length of study + 90 days", application_method: "Online" },
  { country_name: "Germany", country_image: img("germany"), visa_type: "Work visa", processing_time: "6-8 weeks", required_documents: docs.work, description: "National visa for skilled professionals with a binding job offer from a German employer.", age_restriction: 18, fee: 75, validity: "1 year, renewable", application_method: "Embassy" },
  { country_name: "Thailand", country_image: img("thailand"), visa_type: "Tourist visa", processing_time: "3-5 working days", required_documents: docs.travel, description: "Single-entry tourist visa covering holidays, island trips and short visits to friends.", age_restriction: 0, fee: 40, validity: "60 days", application_method: "Online" },
  { country_name: "United Arab Emirates", country_image: img("uae"), visa_type: "Transit visa", processing_time: "2-3 working days", required_documents: docs.basic, description: "Short transit visa for passengers with a connecting flight who want to leave the airport during a layover.", age_restriction: 0, fee: 25, validity: "96 hours", application_method: "Online" },
  { country_name: "France", country_image: img("france"), visa_type: "Official visa", processing_time: "10-15 working days", required_documents: docs.basic, description: "For government delegates and officials travelling to France on duty. An official invitation or mission order is required.", age_restriction: 0, fee: 0, validity: "Duration of mission", application_method: "Embassy" },
  { country_name: "Australia", country_image: img("australia"), visa_type: "Student visa", processing_time: "4-8 weeks", required_documents: docs.study, description: "Subclass 500 student visa for international students enrolled in a registered Australian course.", age_restriction: 16, fee: 710, validity: "Up to 5 years", application_method: "Online" },
  { country_name: "Singapore", country_image: img("singapore"), visa_type: "Tourist visa", processing_time: "3-5 working days", required_documents: docs.travel, description: "Short visit pass for tourism and business meetings, applied through an authorised local contact.", age_restriction: 0, fee: 30, validity: "30 days", application_method: "Online" },
];

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const col = client.db("visaNavigatorDB").collection("visas");

    await col.deleteMany({ addedBy: owner });

    const now = Date.now();
    const result = await col.insertMany(
      visas.map((v, i) => ({ ...v, addedBy: owner, createdAt: new Date(now + i * 1000) }))
    );
    console.log(`Inserted ${result.insertedCount} visas`);
  } finally {
    await client.close();
  }
})();
