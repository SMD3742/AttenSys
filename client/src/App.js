  // Fix: Define handleAttendanceChange for StudentList
  const handleAttendanceChange = (studentId, attendance) => {
    setAttendanceData((prevData) => ({
      ...prevData,
      [studentId]: attendance,
    }));
  };
import React, { useState, useEffect } from 'react';
import './App.css';
import Axios from 'axios';
import { BrowserRouter as Router, Route,Routes, Link } from 'react-router-dom';
import StudentList from './StudentList';
import StudentFormPage from './StudentFormPage'; // Import StudentFormPage component
import ParentComponent from './ParentComponent';
// import RemoveStudentPage from './RemoveStudentPage'; 
const URL = '';
function App() {
  const [name, setName] = useState('');
  const [rollnumber, setRollnumber] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
  Axios.get(`/api/read`)
      .then((response) => {
        setStudentList(response.data);
      })
      .catch((error) => {
        console.error('Error fetching student list:', error);
      });
  }, []);

  // ...existing code...
  return (

      <div className="App">
        <nav className="MenuBar">
          {/* Menu bar with links to StudentFormPage and RemoveStudentPage */}
          <Link to="/form">ADD VOLUNTEER</Link>
        <Link to="/remove">REMOVE VOLUNTEER</Link>
        <Link to="/data">DOWNLOAD ATTENDANCE</Link>
        </nav>

      <StudentList
          studentList={studentList}
          attendanceData={attendanceData}
          handleAttendanceChange={handleAttendanceChange}
        />
      {/* <ParentComponent studentlist={studentList} /> */}
      <div className="ButtonContainer">
        {/* <button className="UpdateButton" onClick={handleUpdateAttendance}>
          Update
        </button> */}
        
      </div>
      </div>
  );
}

export default App;
