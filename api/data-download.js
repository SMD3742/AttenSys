import mongoose from 'mongoose';
import AttendanceModel from '../server/models/Attendance2';
import StudentModel from '../server/models/Student1';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';

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

  const startDate = new Date(req.query.start);
  const endDate = new Date(req.query.end);

  try {
    const attendanceRecords = await AttendanceModel.find({ date: { $gte: startDate, $lte: endDate } }).populate('attendanceRecords.studentId');
    if (attendanceRecords.length === 0) {
      return res.status(404).json({ error: 'Attendance data not found' });
    }
    const uniqueDates = [...new Set(attendanceRecords.map(record => record.date.toISOString().split('T')[0]))];
    const studentData = [...new Set(attendanceRecords.flatMap(record => record.attendanceRecords.map(r => r.studentId)))];
    const filteredStudentData = studentData.filter(student => student !== null);
    const csvData = filteredStudentData.map(student => {
      const rowData = {
        Name: student.Name,
        YearOfStudy: student.Year_of_studying || '',
        Gender: student.Gender || '',
      };
      uniqueDates.forEach(date => {
        const attendanceRecord = attendanceRecords.find(record => record.date.toISOString().split('T')[0] === date);
        if (attendanceRecord && attendanceRecord.attendanceRecords) {
          const attendance = attendanceRecord.attendanceRecords.find(r => r.studentId && r.studentId.Name === student.Name);
          rowData[date] = attendance ? attendance.attendance : '';
        } else {
          rowData[date] = '';
        }
      });
      return rowData;
    });
    const csvHeader = [
      { id: 'Name', title: 'Name' },
      { id: 'YearOfStudy', title: 'Year of Study' },
      { id: 'Gender', title: 'Gender' },
      ...uniqueDates.map(date => ({ id: date, title: date })),
    ];
    const filePath = '/tmp/attendance.csv';
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: csvHeader
    });
    await csvWriter.writeRecords(csvData);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error generating attendance CSV:', error);
    res.status(500).json({ error: 'Error generating attendance CSV' });
  }
}
