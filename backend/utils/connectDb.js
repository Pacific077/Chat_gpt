import mongoose from "mongoose";
const ConnectDb = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb://127.0.0.1:27017/openai"
    );
    console.log(`Connected to database ${conn.connection.host}`);
  } catch (error) {
    console.log(`error in connecting to mongodb ${error.message}`);
    process.exit(1);
  }
};
export default ConnectDb;

//rahmanfaisal516
//B3OJLjNE1X3A2p8H
//mongodb+srv://rahmanfaisal516:7sKTEJLa97JexGPh@chatgpt.svmlxf6.mongodb.net/chat-gpt?retryWrites=true&w=majority