import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MoreVertical, Play, CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

const TaskCard = () => {
    //  Add Features
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startTime, setStartTime] = useState("08:00");
    const { getToken } = useAuth();

    const API_BASE_URL = 'http://localhost:3000/api';

    const getUserToken = async () => {
        // Get the Clerk JWT using the 'supabase' template you configured
        const token = await getToken({ template: 'supabase' });
        return token;
    }


    // Fetch tasks from API
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getUserToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch tasks: ${response.status}`);
            }

            const data = await response.json();

            // Transform API data to match component structure
            const transformedTasks = data.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description || '',
                startTime: task.start_time || "09:00",
                endTime: task.end_time || "10:00",
                priority: task.priority || "MEDIUM",
                status: task.status || "Pending",
                category: getCategoryFromTags(task.tags) || "Work",
                completed: task.status === "Completed" || task.completed_at !== null,
                due_date: task.due_date,
                tags: task.tags || [],
                estimatedDuration: task.estimatedDuration || 30
            }));

            setTasks(transformedTasks);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get category from tags
    const getCategoryFromTags = (tags) => {
        if (!tags || tags.length === 0) return "Work";
        const tagString = tags.join(' ').toLowerCase();
        if (tagString.includes('health') || tagString.includes('workout') || tagString.includes('exercise')) return "Health";
        if (tagString.includes('personal') || tagString.includes('lunch') || tagString.includes('break')) return "Personal";
        return "Work";
    };

    // Update task completion status
    const toggleTaskCompletion = async (taskId) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            const newCompletedStatus = !task.completed;
            const token = await getUserToken();

            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newCompletedStatus ? "Completed" : "Pending",
                    completed_at: newCompletedStatus ? new Date().toISOString() : null
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            // Update local state
            setTasks(tasks.map(task =>
                task.id === taskId
                    ? { ...task, completed: newCompletedStatus, status: newCompletedStatus ? "Completed" : "Pending" }
                    : task
            ));
        } catch (err) {
            console.error('Error updating task:', err);
            setError('Failed to update task');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority.toUpperCase()) {
            case 'HIGH': return 'bg-slate-600 text-white';
            case 'MEDIUM': return 'bg-teal-600 text-white';
            case 'LOW': return 'bg-teal-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Health': return 'bg-teal-100 text-teal-800';
            case 'Work': return 'bg-slate-200 text-slate-800';
            case 'Personal': return 'bg-teal-50 text-teal-700';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const autoScheduleTasks = () => {
        let currentTime = startTime;
        const updatedTasks = tasks.map(task => {
            if (!task.completed) {
                const [hours, minutes] = currentTime.split(':').map(Number);
                const taskDuration = task.estimatedDuration || 30;
                const totalMinutes = hours * 60 + minutes + taskDuration;
                const newEndHours = Math.floor(totalMinutes / 60);
                const newEndMinutes = totalMinutes % 60;

                const newTask = {
                    ...task,
                    startTime: currentTime,
                    endTime: `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`
                };

                currentTime = newTask.endTime;
                return newTask;
            }
            return task;
        });

        setTasks(updatedTasks);
    };

    // Fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="w-full">
                <div className="bg-white shadow-sm p-8 rounded-xl text-center">
                    <Loader2 className="mx-auto mb-4 w-8 h-8 text-teal-600 animate-spin" />
                    <p className="text-slate-600">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="w-full">
                <div className="bg-white shadow-sm p-8 border border-red-200 rounded-xl text-center">
                    <AlertCircle className="mx-auto mb-4 w-8 h-8 text-red-500" />
                    <h3 className="mb-2 font-semibold text-red-800">Error Loading Tasks</h3>
                    <p className="mb-4 text-red-600">{error}</p>
                    <button
                        onClick={fetchTasks}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="bg-white shadow-sm mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl">
                <div className="flex flex-col gap-4">
                    <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-3">
                        <h1 className="font-bold text-slate-800 text-lg sm:text-2xl">Today's Tasks ({tasks.length})</h1>

                        <div className="flex gap-2">
                            <button
                                onClick={fetchTasks}
                                className="flex justify-center items-center gap-2 bg-slate-600 hover:bg-slate-700 px-3 sm:px-4 py-2 rounded-lg font-medium text-white text-xs sm:text-sm transition-colors duration-200"
                            >
                                <Loader2 className="w-3 sm:w-4 h-3 sm:h-4" />
                                Refresh
                            </button>

                            <button
                                onClick={autoScheduleTasks}
                                className="flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-700 px-3 sm:px-4 py-2 rounded-lg font-medium text-white text-xs sm:text-sm transition-colors duration-200"
                            >
                                <Calendar className="w-3 sm:w-4 h-3 sm:h-4" />
                                <span className="hidden sm:inline">Auto-Schedule Tasks</span>
                                <span className="sm:hidden">Auto-Schedule</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex sm:flex-row flex-col items-start sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-slate-500" />
                            <span className="text-slate-600 text-xs sm:text-sm">Start Time:</span>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="flex-1 sm:flex-none px-2 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs sm:text-sm"
                            />
                        </div>
                    </div>

                    <p className="text-slate-600 text-xs sm:text-sm">
                        Set your preferred start time and click "Auto-Schedule" to automatically assign times to all tasks based on their duration.
                    </p>
                </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-3 sm:space-y-4">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6 border-l-4 ${task.completed ? 'border-teal-500 bg-teal-50/30' : 'border-transparent'
                            }`}
                    >
                        <div className="flex items-start gap-2 sm:gap-4">
                            {/* Drag Handle - Hidden on mobile */}
                            <div className="hidden sm:flex flex-col gap-1 mt-1 cursor-grab active:cursor-grabbing">
                                <div className="bg-slate-400 rounded-full w-1 h-1"></div>
                                <div className="bg-slate-400 rounded-full w-1 h-1"></div>
                                <div className="bg-slate-400 rounded-full w-1 h-1"></div>
                                <div className="bg-slate-400 rounded-full w-1 h-1"></div>
                                <div className="bg-slate-400 rounded-full w-1 h-1"></div>
                                <div className="bg-slate-400 rounded-full w-1 h-1"></div>
                            </div>

                            {/* Task Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-3 mb-3">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
                                            <button
                                                onClick={() => toggleTaskCompletion(task.id)}
                                                className="flex-shrink-0 hover:scale-110 transition-transform duration-200"
                                            >
                                                {task.completed ? (
                                                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-teal-500" />
                                                ) : (
                                                    <Circle className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400 hover:text-slate-600" />
                                                )}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-semibold text-base sm:text-lg ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'} truncate`}>
                                                    {task.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            <button className="flex-shrink-0 hover:bg-slate-100 p-1 rounded-md transition-colors duration-200">
                                                <MoreVertical className="w-4 h-4 text-slate-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <p className={`text-slate-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base ${task.completed ? 'line-through' : ''}`}>
                                    {task.description}
                                </p>

                                <div className="flex sm:flex-row flex-col flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-slate-500" />
                                        <span className="text-slate-600">
                                            {task.startTime} — {task.endTime}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${task.status === 'Completed' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-800'
                                            }`}>
                                            {task.status}
                                        </span>

                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                                            {task.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {tasks.length === 0 && (
                <div className="bg-white shadow-sm p-8 sm:p-12 rounded-xl text-center">
                    <div className="flex justify-center items-center bg-slate-100 mx-auto mb-4 rounded-full w-12 sm:w-16 h-12 sm:h-16">
                        <Calendar className="w-6 sm:w-8 h-6 sm:h-8 text-slate-400" />
                    </div>
                    <h3 className="mb-2 font-semibold text-slate-800 text-base sm:text-lg">No tasks scheduled</h3>
                    <p className="text-slate-600 text-sm sm:text-base">Add some tasks to get started with your daily schedule.</p>
                </div>
            )}
        </div>
    );
};

export default TaskCard;