const mongoose = require("mongoose");

async function createDatabase() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to ${conn.connections[0].name}`);
  } catch (err) {
    console.log(`Error connecting to the DB: ${err}`);
  }
}

module.exports = {
  disconnect: async () => {
    await mongoose.connection.close();
  },
  createDatabase,
};
