import { useState } from "react";
import { Book, Users, Calendar } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    courses: 3,
    pendingRequests: 5,
    upcomingTests: 2,
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, Teacher!</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your courses and activities.</p>
      
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-6 bg-white shadow-md rounded-xl flex items-center gap-4 border border-gray-200">
            <Book className="text-blue-600" size={40} />
            <div>
              <p className="text-xl font-semibold text-gray-800">{stats.courses}</p>
              <p className="text-gray-600">Courses</p>
            </div>
          </div>
          <div className="p-6 bg-white shadow-md rounded-xl flex items-center gap-4 border border-gray-200">
            <Users className="text-green-600" size={40} />
            <div>
              <p className="text-xl font-semibold text-gray-800">{stats.pendingRequests}</p>
              <p className="text-gray-600">Pending Requests</p>
            </div>
          </div>
          <div className="p-6 bg-white shadow-md rounded-xl flex items-center gap-4 border border-gray-200">
            <Calendar className="text-red-600" size={40} />
            <div>
              <p className="text-xl font-semibold text-gray-800">{stats.upcomingTests}</p>
              <p className="text-gray-600">Upcoming Tests</p>
            </div>
          </div>
        </div>
      
        {/* Courses Overview */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800">Your Courses</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Mathematics 101", students: 12 },
              { name: "Physics 202", students: 15 },
              { name: "Computer Science", students: 18 },
            ].map((course, index) => (
              <div key={index} className="p-6 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-gray-800">{course.name}</h3>
                <p className="text-gray-600">{course.students} students enrolled</p>
                <button className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">Manage</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}