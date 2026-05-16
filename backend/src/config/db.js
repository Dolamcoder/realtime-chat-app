import mongoose from "mongoose"
export const connectDB=async()=>{
    try{
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Kết nối thành công");
    }catch(e){
        console.log("kết nối thất bại", e)
    }
}