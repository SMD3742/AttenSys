import mongoose from 'mongoose';
import StudentModel from '../server/models/Student1';

const MONGODB_URI = process.env.MONGODB_URI;
let cached = global.mongoose || {};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!cached.conn) {
    cached.conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    global.mongoose = cached;
  }

  const { registerNumber } = req.query;
  try {
    const student = await StudentModel.findOne({ Register_number: registerNumber });
    if (student) {
      res.status(200).json(student);
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
