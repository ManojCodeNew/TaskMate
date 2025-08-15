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
            case 'HIGH': return 'bg-red-500 text-white';
            case 'MEDIUM': return 'bg-orange-500 text-white';
            case 'LOW': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Health': return 'bg-blue-100 text-blue-800';
            case 'Work': return 'bg-purple-100 text-purple-800';
            case 'Personal': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
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
        <div className="bg-gray-50 mx-auto p-6 max-w-4xl min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm mb-6 p-6 rounded-xl">
                <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4">
                    <h1 className="font-bold text-gray-900 text-2xl">Today's Tasks ({tasks.length})</h1>

                    <div className="flex sm:flex-row flex-col items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-600 text-sm">Start Time:</span>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>

                        <button
                            onClick={autoScheduleTasks}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium text-white text-sm transition-colors duration-200"
                        >
                            <Calendar className="w-4 h-4" />
                            Auto-Schedule Tasks
                        </button>
                    </div>
                </div>

                <p className="mt-2 text-gray-600 text-sm">
                    Set your preferred start time and click "Auto-Schedule" to automatically assign times to all tasks based on their duration.
                </p>
            </div>

            {/* Task Cards */}
            <div className="space-y-4">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border-l-4 ${task.completed ? 'border-green-500 bg-green-50/30' : 'border-transparent'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Drag Handle */}
                            <div className="flex flex-col gap-1 mt-1 cursor-grab active:cursor-grabbing">
                                <div className="bg-gray-400 rounded-full w-1 h-1"></div>
                                <div className="bg-gray-400 rounded-full w-1 h-1"></div>
                                <div className="bg-gray-400 rounded-full w-1 h-1"></div>
                                <div className="bg-gray-400 rounded-full w-1 h-1"></div>
                                <div className="bg-gray-400 rounded-full w-1 h-1"></div>
                                <div className="bg-gray-400 rounded-full w-1 h-1"></div>
                            </div>

                            {/* Task Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex sm:flex-row flex-col justify-between sm:items-start gap-3 mb-3">
                                    <div className="flex flex-1 items-center gap-3 min-w-0">
                                        <button
                                            onClick={() => toggleTaskCompletion(task.id)}
                                            className="flex-shrink-0 hover:scale-110 transition-transform duration-200"
                                        >
                                            {task.completed ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                                {task.title}
                                            </h3>
                                        </div>

                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </div>

                                    <button className="flex-shrink-0 hover:bg-gray-100 p-1 rounded-md transition-colors duration-200">
                                        <MoreVertical className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>

                                <p className={`text-gray-600 mb-4 leading-relaxed ${task.completed ? 'line-through' : ''}`}>
                                    {task.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-600">
                                            {task.startTime} — {task.endTime}
                                        </span>
                                    </div>

                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {task.status}
                                    </span>

                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                                        {task.category}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {tasks.length === 0 && (
                <div className="bg-white shadow-sm p-12 rounded-xl text-center">
                    <div className="flex justify-center items-center bg-gray-100 mx-auto mb-4 rounded-full w-16 h-16">
                        <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-lg">No tasks scheduled</h3>
                    <p className="text-gray-600">Add some tasks to get started with your daily schedule.</p>
                </div>
            )}
        </div>
    );
};

export default TaskCard;