const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

exports.connect = () => {
  // Connecting to the database
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Conectado a base de datos");
    })
    .catch((error) => {
      console.log("Error al conectar a la base de datos");
      console.error(error);
      process.exit(1);
    });
};
