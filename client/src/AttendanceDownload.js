import React, { useState } from 'react';
import './App.css';
import Axios from 'axios';
import './StudentForm.css';

// Removed unused URL variable
function AttendanceDownload() {
    
    const [result, setResult] = useState('');
      const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
  // Removed unused datelist variable
    const handleDownloadAttendance = async (e) => {
        e.preventDefault();
  await Axios.get(`/api/data-download?start=${startDate}&end=${endDate}`, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'attendance.csv');
        document.body.appendChild(link);
        link.click();
          link.remove();
          setResult("Downloaded successfully");
      })
      .catch((error) => {
        console.error('Error downloading attendance data:', error);
      });
  };
    return (
        <div>
            <h1>Download Attendance</h1>
            <form>
            <label>Start Date:</label>
            <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="start date" />
            <label>End Date:</label>
        <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="end date" />
        <button className="DownloadButton" onClick={handleDownloadAttendance}>
          Download Attendance
          </button>
          {result && <p>{result}</p>}
            </form>
            
            </div>
    );
}

export default AttendanceDownload;