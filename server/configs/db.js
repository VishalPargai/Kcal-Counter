import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => console.log("DB connected"))  
        await mongoose.connect(`${process.env.MONGO_URI}/KalCounter`);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

export default connectDB;