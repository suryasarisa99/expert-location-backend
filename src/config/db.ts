import { connect } from "mongoose";

const collection = "Chat";

const DB_Online = `mongodb+srv://suryasarisa99:${process.env.DB_PASS}@cluster0.xtldukm.mongodb.net/${collection}?retryWrites=true&w=majority`;
const DB_Local = `mongodb://localhost:27017/${collection}`;
const DB_LocalIp = `mongodb://192.168.1.13:27017/${collection}`;

const dbConnection = async () => {
  return connect(DB_Local, {})
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log(err);
    });
};

export default dbConnection;
