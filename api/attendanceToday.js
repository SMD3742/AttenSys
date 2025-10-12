import mongoose from 'mongoose';
import AttendanceModel from '../server/models/Attendance2';
import StudentModel from '../server/models/Student1';
import officegen from 'officegen';

const MONGODB_URI = process.env.MONGODB_URI;
let cached = global.mongoose || {};

function isValidDateFormat(date) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(date);
}

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

  const { date } = req.query;
  if (!isValidDateFormat(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
  }

  try {
    const attendanceRecord = await AttendanceModel.findOne({ date: new Date(date) });
    if (!attendanceRecord) {
      return res.status(404).json({ error: 'Attendance data not found for the specified date.' });
    }
    const studentDetails = await StudentModel.find({
      _id: { $in: attendanceRecord.attendanceRecords.map(record => record.studentId) },
    });
    const presentStudents = studentDetails.filter(studentDetail =>
      attendanceRecord.attendanceRecords.some(record =>
        record.studentId.equals(studentDetail._id) && record.attendance === 'present'
      )
    );
    const docx = officegen('docx');
    const title = docx.createP();
    title.addText(`Attendance for ${date}`, { font_face: 'Times New Roman', font_size: 14, bold: true });
    const table = [
      [{ val: "S.No", opts: { b: true } },
       { val: "Name", opts: { b: true } },
       { val: "Register Number", opts: { b: true } },
       { val: "Dept", opts: { b: true } },
       { val: "Year", opts: { b: true } }]
    ];
    presentStudents.forEach((studentDetail, index) => {
      table.push([index + 1, studentDetail.Name, studentDetail.Register_number, studentDetail.Branch_of_studying, studentDetail.Year_of_studying]);
    });
    docx.createTable(table);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${date}.docx`);
    docx.generate(res);
  } catch (error) {
    console.error('Error generating and sending Word document:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
