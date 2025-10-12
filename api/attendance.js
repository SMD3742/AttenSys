import mongoose from 'mongoose';
import AttendanceModel from '../server/models/Attendance2';

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

  const attendanceData = req.body.attendanceData;
  const fdate = new Date();
  fdate.setDate(fdate.getDate(), 1);
  const date = fdate.toISOString().split('T')[0];

  const attendanceRecords = attendanceData.map(data => ({
    studentId: data.studentId,
    attendance: data.attendance
  }));

  try {
    await AttendanceModel.findOneAndUpdate(
      { date },
      { $set: { attendanceRecords } },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ error: 'Error recording attendance' });
  }
}
