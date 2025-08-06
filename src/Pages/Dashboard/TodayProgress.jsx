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
        {/* <div className="space-y-6  p-6 max-w-md"> */}

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
                            <p className="font-medium text-blue-600 text-sm  ">Remaining</p>
                            <p className="font-bold text-blue-700 text-2xl">{remainingTasks}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodayProgress;