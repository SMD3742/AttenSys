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

  try {
    const data = await StudentModel.find({});
    res.status(200).json(data);
  } catch (err) {
    console.error('Error reading students:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
