import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const TodayProgress = () => {
    const [tasks, setTasks] = useState([
        { id: 1, title: "Morning Workout", completed: true },
        { id: 2, title: "Team Meeting", completed: false },
        { id: 3, title: "Project Review", completed: false },
        { id: 4, title: "Client Call", completed: false }
    ]);

    const [animatedProgress, setAnimatedProgress] = useState(0);

    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const remainingTasks = totalTasks - completedTasks;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Animate progress bar on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(progressPercentage);
        }, 300);
        return () => clearTimeout(timer);
    }, [progressPercentage]);

    const toggleTask = (taskId) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 75) return 'from-green-500 to-emerald-600';
        if (percentage >= 50) return 'from-blue-500 to-indigo-600';
        if (percentage >= 25) return 'from-purple-500 to-violet-600';
        return 'from-gray-400 to-gray-500';
    };

    const getProgressTextColor = (percentage) => {
        if (percentage >= 75) return 'text-green-600';
        if (percentage >= 50) return 'text-blue-600';
        if (percentage >= 25) return 'text-purple-600';
        return 'text-gray-600';
    };

    return (
        <div className="space-y-6 mx-auto p-6 max-w-4xl">
            {/* Main Progress Card */}
            <div className="bg-white shadow-lg hover:shadow-xl p-6 border border-gray-100 rounded-2xl transition-all duration-300">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                            <Target className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="font-bold text-gray-900 text-xl">Today's Progress</h2>
                    </div>

                    <div className="text-right">
                        <span className="text-gray-500 text-sm">{completedTasks} of {totalTasks} tasks</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 text-sm">Overall Progress</span>
                        <span className={`text-2xl font-bold ${getProgressTextColor(progressPercentage)} transition-colors duration-300`}>
                            {progressPercentage}%
                        </span>
                    </div>

                    <div className="relative">
                        <div className="bg-gray-200 rounded-full w-full h-3 overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getProgressColor(progressPercentage)} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                                style={{ width: `${animatedProgress}%` }}
                            >
                                {/* Animated shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            </div>
                        </div>

                        {/* Progress indicator dot */}
                        <div
                            className={`absolute top-1/2 w-4 h-4 bg-white border-2 border-purple-500 rounded-full transform -translate-y-1/2 transition-all duration-1000 ease-out shadow-md`}
                            style={{ left: `calc(${animatedProgress}% - 8px)` }}
                        ></div>
                    </div>
                </div>

                {/* Stats */}
                <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                    {/* Completed Tasks */}
                    <div className="flex items-center gap-3 bg-green-50 p-4 border border-green-100 rounded-xl">
                        <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium text-green-600 text-sm">Completed</p>
                            <p className="font-bold text-green-700 text-2xl">{completedTasks}</p>
                        </div>
                    </div>

                    {/* Remaining Tasks */}
                    <div className="flex items-center gap-3 bg-blue-50 p-4 border border-blue-100 rounded-xl">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-blue-600 text-sm">Remaining</p>
                            <p className="font-bold text-blue-700 text-2xl">{remainingTasks}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Message */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 mt-6 p-4 border border-purple-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-700 text-sm">Progress Insight</span>
                    </div>
                    <p className="text-purple-600 text-sm">
                        {progressPercentage === 100 ? (
                            "🎉 Congratulations! You've completed all tasks for today!"
                        ) : progressPercentage >= 75 ? (
                            "🔥 You're doing great! Almost there, keep up the momentum!"
                        ) : progressPercentage >= 50 ? (
                            "💪 Good progress! You're halfway through your tasks."
                        ) : progressPercentage >= 25 ? (
                            "🚀 Nice start! Keep going to build momentum."
                        ) : (
                            "📋 Ready to tackle your tasks? Let's get started!"
                        )}
                    </p>
                </div>
            </div>

            {/* Quick Task List (Demo) */}
            <div className="bg-white shadow-lg p-6 border border-gray-100 rounded-2xl">
                <h3 className="mb-4 font-semibold text-gray-900 text-lg">Quick Task Overview</h3>
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200">
                            <button
                                onClick={() => toggleTask(task.id)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${task.completed
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-gray-300 hover:border-green-400'
                                    }`}
                            >
                                {task.completed && <CheckCircle className="w-3 h-3" />}
                            </button>
                            <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                {task.title}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${task.completed
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                {task.completed ? 'Done' : 'Pending'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Stats Summary */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg p-6 rounded-xl text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-purple-100 text-sm">Completion Rate</p>
                            <p className="font-bold text-3xl">{progressPercentage}%</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg p-6 rounded-xl text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-green-100 text-sm">Tasks Done</p>
                            <p className="font-bold text-3xl">{completedTasks}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg p-6 rounded-xl text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-blue-100 text-sm">Remaining</p>
                            <p className="font-bold text-3xl">{remainingTasks}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodayProgress;