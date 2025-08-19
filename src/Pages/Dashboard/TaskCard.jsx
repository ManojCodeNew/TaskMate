import React, { useState } from 'react';
import { Clock, Calendar, MoreVertical, Play, CheckCircle, Circle } from 'lucide-react';

const TaskCard = () => {
    // Task List Features 
    // 1. Reorder
    // 2. Auto Schedule Time
    // 3. Mark as acompleted 
    // 4. edit & delete task
    const [tasks, setTasks] = useState([
        {
            id: 1,
            title: "Morning Workout Session",
            description: "30-minute cardio and strength training routine",
            startTime: "07:00",
            endTime: "07:30",
            priority: "HIGH",
            status: "Completed",
            category: "Health",
            completed: true
        },
        {
            id: 2,
            title: "Team Standup Meeting",
            description: "Daily sync with the development team to discuss progress and blockers",
            startTime: "09:00",
            endTime: "09:30",
            priority: "HIGH",
            status: "Pending",
            category: "Work",
            completed: false
        },
        {
            id: 3,
            title: "Review Project Proposals",
            description: "Go through client proposals and prepare feedback for the afternoon meeting",
            startTime: "10:00",
            endTime: "11:30",
            priority: "MEDIUM",
            status: "Pending",
            category: "Work",
            completed: false
        },
        {
            id: 4,
            title: "Lunch Break",
            description: "Take a proper break and have lunch with colleagues",
            startTime: "12:30",
            endTime: "13:30",
            priority: "LOW",
            status: "Pending",
            category: "Personal",
            completed: false
        }
    ]);

    const [startTime, setStartTime] = useState("08:00");

    const toggleTaskCompletion = (taskId) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, completed: !task.completed, status: !task.completed ? "Completed" : "Pending" }
                : task
        ));
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
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
        // Simple auto-scheduling logic
        let currentTime = startTime;
        const updatedTasks = tasks.map(task => {
            if (!task.completed) {
                const [hours, minutes] = currentTime.split(':').map(Number);
                const taskDuration = 30; // Default 30 minutes
                const newEndHours = Math.floor((minutes + taskDuration) / 60) + hours;
                const newEndMinutes = (minutes + taskDuration) % 60;

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

    return (
        <div className="w-full">
            {/* Header */}
            <div className="bg-white shadow-sm mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <h1 className="font-bold text-slate-800 text-lg sm:text-2xl">Today's Tasks ({tasks.length})</h1>
                        
                        <button
                            onClick={autoScheduleTasks}
                            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 px-3 sm:px-4 py-2 rounded-lg font-medium text-white text-xs sm:text-sm transition-colors duration-200 w-full sm:w-auto"
                        >
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Auto-Schedule Tasks</span>
                            <span className="sm:hidden">Auto-Schedule</span>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                            <span className="text-slate-600 text-xs sm:text-sm">Start Time:</span>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="px-2 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs sm:text-sm flex-1 sm:flex-none"
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
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                            <button
                                                onClick={() => toggleTaskCompletion(task.id)}
                                                className="flex-shrink-0 hover:scale-110 transition-transform duration-200"
                                            >
                                                                                            {task.completed ? (
                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" />
                                            ) : (
                                                <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 hover:text-slate-600" />
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

                                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                                        <span className="text-slate-600">
                                            {task.startTime} — {task.endTime}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
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
                    <div className="flex justify-center items-center bg-slate-100 mx-auto mb-4 rounded-full w-12 h-12 sm:w-16 sm:h-16">
                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                    </div>
                    <h3 className="mb-2 font-semibold text-slate-800 text-base sm:text-lg">No tasks scheduled</h3>
                    <p className="text-slate-600 text-sm sm:text-base">Add some tasks to get started with your daily schedule.</p>
                </div>
            )}
        </div>
    );
};

export default TaskCard;