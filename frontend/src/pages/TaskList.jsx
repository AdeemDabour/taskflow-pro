import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { tasksAPI } from "../services/api";
import {
  LayoutDashboard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Loader,
  ChevronLeft,
  Edit,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import CreateTaskModal from "../components/tasks/CreateTaskModal";

const TaskList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll();
      setTasks(response.data.data);
    } catch (error) {
      console.error("Fetch tasks error:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

    useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleTaskCreated = () => {
    fetchTasks();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft size={48} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
                <p className="text-sm text-gray-500">{user?.workspace?.name}</p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredTasks.length}</span> of{" "}
              <span className="font-semibold">{tasks.length}</span> tasks
            </p>
            {(searchQuery ||
              statusFilter !== "all" ||
              priorityFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                ? "No tasks match your filters"
                : "No tasks yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first task!"}
            </p>
            {!(
              searchQuery ||
              statusFilter !== "all" ||
              priorityFilter !== "all"
            ) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task._id} task={task} onTaskUpdated={fetchTasks} />
            ))}
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onTaskUpdated }) => {
  const priorityColors = {
    urgent: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  };

  const statusConfig = {
    todo: {
      icon: Circle,
      color: "text-gray-500",
      bg: "bg-gray-100",
      label: "To Do",
    },
    "in-progress": {
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-100",
      label: "In Progress",
    },
    review: {
      icon: AlertCircle,
      color: "text-blue-500",
      bg: "bg-blue-100",
      label: "Review",
    },
    done: {
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-100",
      label: "Done",
    },
  };

  const StatusIcon = statusConfig[task.status]?.icon || Circle;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await tasksAPI.delete(task._id);
      toast.success("Task deleted successfully");
      onTaskUpdated();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <StatusIcon className={statusConfig[task.status]?.color} size={24} />

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {task.title}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toast.success("Edit coming soon!")}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {task.description && (
              <p className="text-gray-600 mb-3">{task.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusConfig[task.status]?.bg
                } ${statusConfig[task.status]?.color}`}
              >
                {statusConfig[task.status]?.label}
              </span>

              {/* Priority Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  priorityColors[task.priority]
                }`}
              >
                {task.priority.toUpperCase()}
              </span>

              {/* Tags */}
              {task.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}

              {/* Due Date */}
              {task.dueDate && (
                <span className="text-xs text-gray-500">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Creator */}
            <p className="text-xs text-gray-500 mt-3">
              Created by {task.createdBy?.name || "Unknown"} •{" "}
              {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
