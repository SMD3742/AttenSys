import mongoose from 'mongoose';
import StudentModel from '../server/models/Student1';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose || {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!cached.conn) {
    cached.conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    global.mongoose = cached;
  }

  const {
    Name,
    Register_number,
    Year_of_studying,
    Branch_of_studying,
    Date_of_Birth,
    Gender,
    Community,
    Minority_Community,
    Blood_Group,
    Aadhar_number,
    Mobile_number,
    Email_id
  } = req.body;

  try {
    const student = new StudentModel({
      Name,
      Register_number,
      Year_of_studying,
      Branch_of_studying,
      Date_of_Birth,
      Gender,
      Community,
      Minority_Community,
      Blood_Group,
      Aadhar_number,
      Mobile_number,
      Email_id
    });
    await student.save();
    res.status(200).json({ message: 'Inserted data successfully' });
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
