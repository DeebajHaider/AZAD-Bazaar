const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectMongo() {
  await mongoose.connect(uri, clientOptions);
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log("MongoDB ping successful!");
  return mongoose;
}

module.exports = { connectMongo };
