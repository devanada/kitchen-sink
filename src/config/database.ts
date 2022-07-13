import mongooseConfig, { ConnectOptions } from "mongoose";

const { MONGO_URI } = process.env;

exports.connect = () => {
  mongooseConfig
    .connect(
      MONGO_URI as string,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions
    )
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error: Error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};
