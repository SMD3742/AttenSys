import mongoose from 'mongoose';
import StudentModel from '../server/models/Student1';

const MONGODB_URI = process.env.MONGODB_URI;
let cached = global.mongoose || {};

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
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
    const foundStudent = await StudentModel.findOne({ Register_number: registerNumber });
    if (!foundStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const studentId = foundStudent._id;
    await StudentModel.findByIdAndRemove(studentId);
    res.status(200).json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
