import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Calendar, CheckCircle, Circle, Loader2, AlertCircle, 
  Tag, Star, Trash2, Plus, RefreshCw, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useTasks } from '../../context/TaskProvider';

const TaskCard = () => {
    const navigate = useNavigate();
    const { tasks, loading, error, fetchTasks, updateTask, deleteTask } = useTasks();
    const [processingTasks, setProcessingTasks] = useState(new Set());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateRange, setDateRange] = useState([]);

    // Generate 7-day date range centered around today
    useEffect(() => {
        const dates = [];
        const today = new Date();

        // Generate 7 days starting from 3 days before today
        for (let i = -3; i <= 3; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }

        setDateRange(dates);
    }, []);

    // Helper function to get category from tags
    const getCategoryFromTags = (tags) => {
        if (!tags || tags.length === 0) return "Work";
        const tagString = tags.join(' ').toLowerCase();
        if (tagString.includes('health') || tagString.includes('workout') || tagString.includes('exercise')) return "Health";
        if (tagString.includes('personal') || tagString.includes('lunch') || tagString.includes('break')) return "Personal";
        return "Work";
    };

    // Transform API data to match component structure
    const transformedTasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority || "medium",
        status: task.status || "pending", 
        category: getCategoryFromTags(task.tags) || "Work",
        completed: task.status === "completed" || task.completed_at !== null,
        due_date: task.due_date,
        tags: task.tags || [],
        estimatedDuration: task.estimatedDuration || 60,
        start_date: task.start_date,
        created_at: task.created_at,
        updated_at: task.updated_at,
        completed_at: task.completed_at
    }));

    // Filter tasks for selected date
    const getTasksForDate = (targetDate) => {
        const targetDateStr = targetDate.toISOString().split("T")[0];
        
        return transformedTasks.filter(task => {
            if (!task) return false;

            // Get start and due dates
            const startDate = new Date(task.start_date).toISOString().split("T")[0];
            const dueDate = new Date(task.due_date).toISOString().split("T")[0];

            // Check if target date is within the task's range (start_date to due_date)
            return targetDateStr >= startDate && targetDateStr <= dueDate;
        });
    };

    const selectedDateTasks = getTasksForDate(selectedDate);

    // Toggle task completion
    const toggleTaskCompletion = async (taskId) => {
        if (processingTasks.has(taskId)) return;

        setProcessingTasks(prev => new Set([...prev, taskId]));

        try {
            const task = transformedTasks.find(t => t.id === taskId);
            const newCompletedStatus = !task.completed;

            await updateTask(taskId, {
                status: newCompletedStatus ? "completed" : "pending",
                completed_at: newCompletedStatus ? new Date().toISOString() : null
            });
        } catch (err) {
            console.error('Error updating task:', err);
        } finally {
            setProcessingTasks(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
            });
        }
    };

    // Delete task with confirmation
    const handleDeleteTask = async (taskId) => {
        if (processingTasks.has(taskId)) return;

        if (!confirm('Are you sure you want to delete this task?')) return;

        setProcessingTasks(prev => new Set([...prev, taskId]));

        try {
            await deleteTask(taskId);
        } catch (err) {
            console.error('Error deleting task:', err);
        } finally {
            setProcessingTasks(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
            });
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Health': return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'Work': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Personal': return 'bg-purple-50 text-purple-700 border-purple-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const todayDate = new Date();
        const tomorrowDate = new Date(todayDate);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        if (date.toDateString() === todayDate.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrowDate.toDateString()) {
            return 'Tomorrow';
        } else if (date < todayDate) {
            return 'Overdue';
        } else {
            return date.toLocaleDateString();
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Check if task is overdue
    const isOverdue = (task) => {
        const dueDate = new Date(task.due_date);
        const todayDate = new Date();
        todayDate.setHours(23, 59, 59, 999);
        return dueDate < todayDate && !task.completed;
    };

    // Helper functions for date selector
    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelectedDate = (date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    const formatSelectorDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="mx-auto p-6 max-w-4xl">
                <div className="bg-white shadow-sm p-12 border border-gray-100 rounded-2xl text-center">
                    <div className="inline-flex justify-center items-center bg-blue-50 mb-4 rounded-full w-16 h-16">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-lg">Loading your tasks</h3>
                    <p className="text-gray-500">Please wait while we fetch your schedule</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="mx-auto p-6 max-w-4xl">
                <div className="bg-white shadow-sm p-12 border border-red-200 rounded-2xl text-center">
                    <div className="inline-flex justify-center items-center bg-red-50 mb-4 rounded-full w-16 h-16">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-lg">Unable to load tasks</h3>
                    <p className="mb-6 text-gray-600">{error}</p>
                    <button
                        onClick={fetchTasks}
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium text-white transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 mx-auto p-6 max-w-6xl">
            {/* Header */}
            <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex justify-center items-center bg-blue-100 rounded-xl w-10 h-10">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 text-2xl">Task Dashboard</h1>
                            <p className="text-gray-500 text-sm">
                                {selectedDateTasks.length} tasks • {selectedDateTasks.filter(t => t.completed).length} completed
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={fetchTasks}
                            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium text-gray-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Date Selector */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-900 text-lg">Select Date</h2>
                    <div className="flex items-center gap-2">
                        <button className="hover:bg-gray-100 p-2 rounded-lg transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="hover:bg-gray-100 p-2 rounded-lg transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 pb-2 overflow-x-auto">
                    {dateRange.map((date, index) => {
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNumber = date.getDate();
                        const isSelected = isSelectedDate(date);
                        const isTodayDate = isToday(date);

                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedDate(date)}
                                className={`flex flex-col items-center justify-center min-w-[80px] h-20 rounded-xl transition-all duration-200 ${isSelected
                                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                        : isTodayDate
                                            ? 'bg-green-50 text-green-700 border-2 border-green-200'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                                    }`}
                            >
                                <span className="mb-1 font-medium text-xs">{dayName}</span>
                                <span className="font-bold text-xl">{dayNumber}</span>
                                {isTodayDate && (
                                    <span className="mt-1 font-medium text-green-600 text-xs">Today</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 text-xl">
                        Tasks for {isToday(selectedDate) ? 'Today' : formatSelectorDate(selectedDate)}
                    </h3>
                    <span className="text-gray-500 text-sm">
                        {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {selectedDateTasks.map((task) => {
                    const taskOverdue = isOverdue(task);
                    
                    return (
                        <div
                            key={task.id}
                            className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                                task.completed 
                                    ? 'border-green-200 bg-green-50/30' 
                                    : taskOverdue 
                                        ? 'border-red-200 bg-red-50/20'
                                        : 'border-gray-200 hover:border-blue-200'
                            }`}
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Completion Toggle */}
                                    <button
                                        onClick={() => toggleTaskCompletion(task.id)}
                                        disabled={processingTasks.has(task.id)}
                                        className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                                    >
                                        {processingTasks.has(task.id) ? (
                                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                        ) : task.completed ? (
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                        ) : (
                                            <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500" />
                                        )}
                                    </button>

                                    {/* Task Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-lg font-semibold ${
                                                    task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                                                }`}>
                                                    {task.title}
                                                </h3>
                                                {taskOverdue && (
                                                    <span className="inline-block bg-red-100 mt-1 px-2 py-1 rounded-full text-red-600 text-xs">
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 ml-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                                    {task.priority.toLowerCase() === 'high' && <Star className="inline mr-1 w-3 h-3" />}
                                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                </span>

                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    disabled={processingTasks.has(task.id)}
                                                    className="hover:bg-red-50 p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {task.description && (
                                            <p className={`text-gray-600 mb-4 ${
                                                task.completed ? 'line-through opacity-70' : ''
                                            }`}>
                                                {task.description}
                                            </p>
                                        )}

                                        {/* Task Details */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium text-gray-700">
                                                    Due: {formatDate(task.due_date)}
                                                </span>
                                                <span className="text-gray-500">
                                                    {formatTime(task.due_date)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium text-gray-700">
                                                    {task.estimatedDuration}min
                                                </span>
                                            </div>

                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                                                task.status === 'completed'
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {task.status === 'completed' && <CheckCircle className="inline mr-1 w-3 h-3" />}
                                                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                            </span>

                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getCategoryColor(task.category)}`}>
                                                <Tag className="inline mr-1 w-3 h-3" />
                                                {task.category}
                                            </span>

                                            <button 
                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                                className="inline-flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium text-blue-600 text-xs transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </div>

                                        {/* Show completion info if completed */}
                                        {task.completed && task.completed_at && (
                                            <div className="mt-3 pt-3 border-gray-100 border-t">
                                                <p className="text-gray-500 text-xs">
                                                    Completed on {formatDate(task.completed_at)} at {formatTime(task.completed_at)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {selectedDateTasks.length === 0 && (
                <div className="bg-white shadow-sm p-12 border border-gray-100 rounded-2xl text-center">
                    <div className="inline-flex justify-center items-center bg-blue-50 mb-4 rounded-full w-16 h-16">
                        <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-xl">No tasks for {isToday(selectedDate) ? 'today' : 'this date'}</h3>
                    <p className="mx-auto mb-6 max-w-md text-gray-500">
                        You don't have any tasks scheduled for {isToday(selectedDate) ? 'today' : 'this date'}. Add some tasks to get started with organizing your schedule.
                    </p>
                    <button 
                        onClick={() => navigate('/add-task')}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Task
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaskCard;