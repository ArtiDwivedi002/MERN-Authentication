import mongoose from "mongoose";

const connectDb = async ()=>{
   mongoose.connection.on('connected',()=>{console.log("Database is connected")});
   await mongoose.connect(`${process.env.MONGO_URL}/mern-auth`);
}
export default connectDb;