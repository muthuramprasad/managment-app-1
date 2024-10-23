import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRouter from './Routes/admin.js';

dotenv.config(); // Load environment variables

const port = process.env.PORT || 4000;
const app = express();

app.use(morgan('dev'));
app.use(express.json());
// var corsOptions = {
//   origin: "*",
// };
// app.use(cors(corsOptions));
app.use(cors());

app.use('/user',userRouter)


// Connect to MongoDB using environment variables
mongoose.set('bufferCommands', false);
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
