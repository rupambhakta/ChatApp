import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment-timezone';

const Calendar = () => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    { name: 'January', days: 31 },
    { name: 'February', days: 28 },
    { name: 'March', days: 31 },
    { name: 'April', days: 30 },
    { name: 'May', days: 31 },
    { name: 'June', days: 30 },
    { name: 'July', days: 31 },
    { name: 'August', days: 31 },
    { name: 'September', days: 30 },
    { name: 'October', days: 31 },
    { name: 'November', days: 30 },
    { name: 'December', days: 31 },
  ];
  const years = Array.from({ length: 50 }, (_, i) => 1999 + i);

  const today = new Date();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const timeZone = "Asia/Kolkata";

  useEffect(() => {
    handleDateClick(today.getDate(), today.getMonth(), today.getFullYear());
  }, []);

  const isLeapYear = (year) =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  const getDaysInMonth = (monthIndex, year) => {
    if (monthIndex === 1) return isLeapYear(year) ? 29 : 28;
    return months[monthIndex].days;
  };

  const handleMonthChange = (e) => {
    setSelectedMonthIndex(parseInt(e.target.value));
    setSelectedDay(null);
    setRegistrations([]);
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
    setSelectedDay(null);
    setRegistrations([]);
  };

  const handleDateClick = async (day, month = selectedMonthIndex, year = selectedYear) => {
    setSelectedDay(day);
    setSelectedMonthIndex(month);
    setSelectedYear(year);
    setCurrentPage(1);
    await fetchRegistrationsForDate(day, month, year);
  };

  const fetchRegistrationsForDate = async (day, month, year) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8001/registration', {
        params: { date: formattedDate },
      });
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStartDay = (year, monthIndex) => {
    const date = new Date(year, monthIndex, 1);
    return date.getDay();
  };

  const renderCalendarGrid = () => {
    const cells = [];
    const startDay = getStartDay(selectedYear, selectedMonthIndex);
    const totalDays = getDaysInMonth(selectedMonthIndex, selectedYear);

    for (let i = 0; i < startDay; i++) {
      cells.push(
        <div key={`empty-${i}`} className="p-4 border bg-gray-100 rounded-md"></div>
      );
    }

    for (let day = 1; day <= totalDays; day++) {
      const isToday =
        day === today.getDate() &&
        selectedMonthIndex === today.getMonth() &&
        selectedYear === today.getFullYear();

      cells.push(
        <motion.div
          key={day}
          onClick={() => handleDateClick(day)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          layout
          className={`p-4 border text-center cursor-pointer rounded-md transition-all duration-300 ease-in-out
            ${selectedDay === day ? 'bg-blue-600 text-white font-bold shadow-lg' : 'hover:bg-blue-100'}
            ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        >
          {day}
        </motion.div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedMonthIndex}-${selectedYear}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-7 gap-1"
        >
          {cells}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="bg-white/80 p-4 rounded-2xl shadow-xl border border-blue-200 w-full">
      <h1 className="text-2xl font-bold text-center text-blue-800 mb-4">📅 Calendar</h1>

      <div className="flex justify-center mb-4">
        <button
          onClick={() => handleDateClick(today.getDate(), today.getMonth(), today.getFullYear())}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-full shadow transition duration-300 transform hover:scale-105"
        >
          Today
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div>
          <label className="text-blue-700 font-medium mr-2">Month:</label>
          <select
            value={selectedMonthIndex}
            onChange={handleMonthChange}
            className="w-full p-2 border rounded border-blue-300 bg-blue-50 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          >
            {months.map((month, index) => (
              <option key={month.name} value={index}>{month.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-blue-700 font-medium mr-2">Year:</label>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="w-full p-2 border rounded border-blue-300 bg-blue-50 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center font-bold text-blue-700 bg-blue-100 rounded-t-md">
        {daysOfWeek.map((day) => (
          <div key={day} className="p-2 border text-xs md:text-sm">{day}</div>
        ))}
      </div>

      <div className="bg-white rounded-b-md border border-blue-100">
        {renderCalendarGrid()}
      </div>
    </div>
  );
};

export default Calendar;