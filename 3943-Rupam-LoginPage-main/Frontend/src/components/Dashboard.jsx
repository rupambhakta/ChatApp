import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Calendar from "./Calender";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("today");
  const navigate = useNavigate();
  const timeZone = "Asia/Kolkata";
  const todayDate = moment().tz(timeZone).format("YYYY-MM-DD");
  const [userCounts, setUserCounts] = useState({});

  const fecthData = async (startDate, endDate) => {
    setLoading(true);
    try {
      const responce = await axios.post(
        "http://localhost:5080/admin/dashboard",
        {
          startDate: startDate,
          endDate: endDate,
        }
      );

      setUsers(responce.data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.error("Error fetching users:", e);
    }
  };

  const customSearch = () => {
    fecthData(startDate, endDate);
  };

  const handleCustomTabClick = () => {
    setUsers([]);
    setTab("custom");
  };

  const hendleLogout = async () => {
    localStorage.removeItem("tokenForAdmin");
    navigate("/admin/login");
  };

  const handleTodaySearch = () => {
    setTab("today");
    const today = moment().tz(timeZone).format("YYYY-MM-DD");
    fecthData(today, today);
  };

  const handleYesterday = async () => {
    setTab("yesterday");
    const yesterday = moment()
      .tz(timeZone)
      .subtract(1, "days")
      .format("YYYY-MM-DD");
    fecthData(yesterday, yesterday);
  };

  const handleLast7Days = async () => {
    setTab("last7Days");
    const today = moment().tz(timeZone).format("YYYY-MM-DD");
    const sevenDaysAgo = moment()
      .tz(timeZone)
      .subtract(6, "days")
      .format("YYYY-MM-DD");
    fecthData(sevenDaysAgo, today);
  };

  const handleLastweek = async () => {
    setTab("lastWeek");
    const today = moment().tz(timeZone);
    const lastMonday = today.clone().startOf("week").subtract(1, "week");
    const lastSunday = today.clone().endOf("week").subtract(1, "week");
    const lastWeekStart = lastMonday.format("YYYY-MM-DD");
    const lastWeekEnd = lastSunday.format("YYYY-MM-DD");

    fecthData(lastWeekStart, lastWeekEnd);
  };

  const handleMonthTillDate = async () => {
    setTab("MonthTillDate");
    const today = moment().tz(timeZone);
    const monthStart = today.clone().startOf("month");
    const monthStartFormatted = monthStart.format("YYYY-MM-DD");
    const todayFormatted = today.format("YYYY-MM-DD");

    fecthData(monthStartFormatted, todayFormatted);
  };

  const handleLastMonth = async () => {
    setTab("LastMonth");
    const today = moment().tz(timeZone);
    const lastMonthStart = today.clone().subtract(1, "month").startOf("month");
    const lastMonthEnd = today.clone().subtract(1, "month").endOf("month");

    const lastMonthStartFormatted = lastMonthStart.format("YYYY-MM-DD");
    const lastMonthEndFormatted = lastMonthEnd.format("YYYY-MM-DD");

    fecthData(lastMonthStartFormatted, lastMonthEndFormatted);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  useEffect(() => {
    if (!localStorage.getItem("tokenForAdmin")) {
      navigate("/admin/login");
    }
    handleTodaySearch();
  }, [navigate]);

  useEffect(() => {
    const counts = {};
    users.forEach((user) => {
      const registeredDate = moment(user.createdAt)
        .tz(timeZone)
        .format("YYYY-MM-DD");
      counts[registeredDate] = (counts[registeredDate] || 0) + 1;
    });
    setUserCounts(counts);
  }, [users, timeZone]);

  const chartData = {
    labels: Object.keys(userCounts),
    datasets: [
      {
        label: "Users Registered",
        data: Object.values(userCounts),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "User Registration Progress",
      },
    },
  };

  const showChart =
    tab !== "today" &&
    tab !== "yesterday" &&
    Object.keys(userCounts).length > 0;

  return (
    <>
      <div className="bg-gradient-to-br from-white via-blue-100 to-blue-300 min-h-screen">
        <div className="flex justify-end p-3">
          <button
            onClick={hendleLogout}
            className="text-white bg-black hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 shadow-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>
        <div className="min-h-screen flex flex-col gap-5 items-center justify-start pt-5">
          <div className="flex gap-4 text-white">
            <button
              onClick={handleTodaySearch}
              className={`border-2 border-black  px-5 py-2 rounded-4xl cursor-pointer font-semibold shadow-md transition-colors duration-200 ${
                tab === "today"
                  ? "bg-blue-700 text-white"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }`}
            >
              Today
            </button>
            <button
              onClick={handleYesterday}
              className={`border-2 border-black  px-5 py-2 rounded-4xl cursor-pointer font-semibold shadow-md transition-colors duration-200 ${
                tab === "yesterday"
                  ? "bg-blue-700 text-white"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }`}
            >
              Yesterday
            </button>

            <button
              onClick={handleLast7Days}
              className={`border-2 border-black  px-5 py-2 rounded-4xl cursor-pointer font-semibold shadow-md transition-colors duration-200 ${
                tab === "last7Days"
                  ? "bg-blue-700 text-white"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={handleLastweek}
              className={`border-2 border-black  px-5 py-2 rounded-4xl cursor-pointer font-semibold shadow-md transition-colors duration-200 ${
                tab === "lastWeek"
                  ? "bg-blue-700 text-white"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }`}
            >
              Last week
            </button>
            <button
              onClick={handleMonthTillDate}
              className={`border-2 border-black  px-5 py-2 rounded-4xl cursor-pointer font-semibold shadow-md transition-colors duration-200 ${
                tab === "MonthTillDate"
                  ? "bg-blue-700 text-white"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }`}
            >
              Month Till Date
            </button>
            <button
              onClick={handleLastMonth}
              className={`border-2 border-black  px-5 py-2 rounded-4xl cursor-pointer font-semibold shadow-md transition-colors duration-200 ${
                tab === "LastMonth"
                  ? "bg-blue-700 text-white"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }`}
            >
              Last Month
            </button>

            <button
              onClick={handleCustomTabClick}
              className={`border-2 border-black px-5 py-2 rounded-4xl cursor-pointer font-semibold shadow-md transition-colors duration-200 ${
                tab === "custom"
                  ? "bg-blue-700 text-white"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }`}
              disabled={tab === "custom"}
            >
              Custom
            </button>
          </div>
          {tab === "custom" && (
            <div className="flex w-3/5 justify-center items-center mx-auto gap-5">
              <Calendar />
              <div className="mt-2 bg-white p-6 rounded-2xl shadow-xl border border-blue-200 flex flex-col gap-4 w-full max-w-md mx-auto">
                <h2 className="text-xl font-bold text-blue-800 mb-2">
                  Custom Date Search
                </h2>
                <div className="flex flex-col gap-2">
                  <label className="text-blue-700 font-semibold mb-1">
                    Start Date:
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    max={todayDate}
                    onChange={handleStartDateChange}
                    className="border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900 shadow-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-blue-700 font-semibold mb-1">
                    End Date:
                  </label>
                  <input
                    min={startDate}
                    max={todayDate}
                    disabled={!startDate}
                    onChange={handleEndDateChange}
                    type="date"
                    value={endDate}
                    className="border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900 shadow-sm"
                  />
                </div>
                <button
                  onClick={customSearch}
                  className="mt-4 border-2 border-black bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full cursor-pointer font-semibold shadow-md transition-colors duration-200"
                >
                  Search
                </button>
              </div>

            </div>

          )}
          <div>
            {/* Chart Display */}
            {showChart && (
              <div
                className={`p-6 bg-white rounded-2xl shadow-xl border border-blue-200 mb-5`}
              >
                <Bar data={chartData} options={chartOptions} />
              </div>
            )}
            <div>
              <div
                className={`p-6 bg-white rounded-2xl shadow-xl border border-blue-200 mb-5`}
              >
                <div className="flex justify-between pr-2">
                  <h1 className="text-2xl font-bold mb-4 text-blue-800">
                    User Registration Data
                  </h1>
                  <h2 className="text-xl font-bold mb-4 text-blue-800">
                    Total :{" "}
                    <span className="text-green-600">{users.length}</span>
                  </h2>
                </div>
                <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                  <table className="min-w-full bg-white border border-blue-200 shadow-sm rounded-lg">
                    <thead>
                      <tr className="bg-blue-100 text-left text-sm font-semibold text-blue-900">
                        <th className="sticky top-0 bg-blue-100 z-10 px-4 py-2 border-b border-blue-200">
                          Count
                        </th>
                        <th className="sticky top-0 bg-blue-100 z-10 px-4 py-2 border-b border-blue-200">
                          Name
                        </th>
                        <th className="sticky top-0 bg-blue-100 z-10 px-4 py-2 border-b border-blue-200">
                          Email
                        </th>
                        <th className="sticky top-0 bg-blue-100 z-10 px-4 py-2 border-b border-blue-200">
                          Mobile Number
                        </th>
                        <th className="sticky top-0 bg-blue-100 z-10 px-4 py-2 border-b border-blue-200">
                          Registered On
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((user, index) => (
                          <tr key={user._id} className="hover:bg-blue-50">
                            <td className="px-4 py-2 border-b border-blue-100">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2 border-b border-blue-100 text-black">
                              {user.userName}
                            </td>
                            <td className="px-4 py-2 border-b border-blue-100 text-black">
                              {user.emailId}
                            </td>
                            <td className="px-4 py-2 border-b border-blue-100 text-black">
                              {user.mobileNumber}
                            </td>
                            <td className="px-4 py-2 border-b border-blue-100 text-black">
                              {moment(user.createdAt)
                                .tz(timeZone)
                                .format("YYYY-MM-DD")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-4 py-4 text-center text-blue-400"
                          >
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
