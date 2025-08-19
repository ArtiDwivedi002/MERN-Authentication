import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDb from './config/mongoConnect.js';
import authRouter from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';


const app=express();
const port=process.env.PORT || 4000;
connectDb();
const allowedOrigins=['http://localhost:5173','']
app.use(express.json());
app.use(cors({
    origin:allowedOrigins,
    credentials:true
}));
app.use(cookieParser());
app.use('/api/auth',authRouter);
app.use('/api/user',userRoutes);
app.get('/',(req,res)=>{
    res.send("Api is working");
})
app.listen(port,()=>{
    console.log(`Server started on ${port}`);
});
