import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import { useNavigate } from "react-router-dom";
import { tasksAPI, workspaceAPI } from "../services/api";
import {
  LayoutDashboard,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  Plus,
  LogOut,
  Loader,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats, tasks, and members in parallel
      const [statsRes, tasksRes, membersRes] = await Promise.all([
        tasksAPI.getStats(),
        tasksAPI.getAll({ limit: 5 }),
        workspaceAPI.getMembers(),
      ]);

      setStats(statsRes.data.data);
      setRecentTasks(tasksRes.data.data.slice(0, 5));
      setMembers(membersRes.data.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };
  const handleTaskCreated = () => {
    fetchDashboardData(); // Refresh all data
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  TaskFlow Pro
                </h1>
                <p className="text-sm text-gray-500">{user?.workspace?.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your tasks today.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tasks */}
          <StatCard
            title="Total Tasks"
            value={stats?.total || 0}
            icon={<LayoutDashboard className="text-blue-600" size={24} />}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />

          {/* Todo */}
          <StatCard
            title="To Do"
            value={stats?.todo || 0}
            icon={<Circle className="text-gray-600" size={24} />}
            bgColor="bg-gray-50"
            textColor="text-gray-600"
          />

          {/* In Progress */}
          <StatCard
            title="In Progress"
            value={stats?.inProgress || 0}
            icon={<Clock className="text-yellow-600" size={24} />}
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
          />

          {/* Done */}
          <StatCard
            title="Completed"
            value={stats?.done || 0}
            icon={<CheckCircle2 className="text-green-600" size={24} />}
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Recent Tasks
              </h3>
              <button
                onClick={() => toast.success("Tasks page coming soon!")}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All →
              </button>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tasks yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Get started by creating your first task!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Create Task
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <TaskItem key={task._id} task={task} />
                ))}
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Team Members
              </h3>
              <Users className="text-gray-400" size={20} />
            </div>

            <div className="space-y-4">
              {members.map((member) => (
                <MemberItem key={member._id} member={member} />
              ))}
            </div>

            {user?.role === "owner" && (
              <button
                onClick={() => toast.success("Add member coming soon!")}
                className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                + Add Member
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionButton
              icon={<Plus size={20} />}
              label="Create Task"
              onClick={() => setShowCreateModal(true)}
            />
            <QuickActionButton
              icon={<Users size={20} />}
              label="Manage Team"
              onClick={() => toast.success("Team management coming soon!")}
            />
            <QuickActionButton
              icon={<LayoutDashboard size={20} />}
              label="View Analytics"
              onClick={() => toast.success("Analytics coming soon!")}
            />
          </div>
        </div>
      </main>
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, bgColor, textColor }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
      <div className={`${bgColor} p-3 rounded-lg`}>{icon}</div>
    </div>
  </div>
);

// Task Item Component
const TaskItem = ({ task }) => {
  const priorityColors = {
    urgent: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  const statusIcons = {
    todo: <Circle size={16} className="text-gray-500" />,
    "in-progress": <Clock size={16} className="text-yellow-500" />,
    review: <AlertCircle size={16} className="text-blue-500" />,
    done: <CheckCircle2 size={16} className="text-green-500" />,
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="flex items-center space-x-3 flex-1">
        {statusIcons[task.status]}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-500 truncate">{task.description}</p>
          )}
        </div>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          priorityColors[task.priority]
        }`}
      >
        {task.priority}
      </span>
    </div>
  );
};

// Member Item Component
const MemberItem = ({ member }) => {
  const roleColors = {
    owner: "bg-purple-100 text-purple-800",
    admin: "bg-blue-100 text-blue-800",
    member: "bg-gray-100 text-gray-800",
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold">
        {getInitials(member.name)}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{member.name}</p>
        <p className="text-xs text-gray-500">{member.email}</p>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          roleColors[member.role]
        }`}
      >
        {member.role}
      </span>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-3 p-4 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all"
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default Dashboard;
