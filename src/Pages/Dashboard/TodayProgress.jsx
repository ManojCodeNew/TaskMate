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
        if (percentage >= 75) return 'from-teal-500 to-teal-600';
        if (percentage >= 50) return 'from-teal-500 to-teal-600';
        if (percentage >= 25) return 'from-teal-400 to-teal-500';
        return 'from-slate-400 to-slate-500';
    };

    const getProgressTextColor = (percentage) => {
        if (percentage >= 75) return 'text-teal-600';
        if (percentage >= 50) return 'text-teal-600';
        if (percentage >= 25) return 'text-teal-600';
        return 'text-slate-600';
    };

    return (
        <div className="w-full">
            {/* Main Progress Card */}
            <div className="bg-white shadow-lg hover:shadow-xl p-4 sm:p-6 border border-slate-200 rounded-2xl transition-all duration-300">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-100 p-2 rounded-full">
                            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                        </div>
                        <h2 className="font-bold text-slate-800 text-lg sm:text-xl">Today's Progress</h2>
                    </div>

                    <div className="text-left sm:text-right">
                        <span className="text-slate-500 text-xs sm:text-sm">{completedTasks} of {totalTasks} tasks</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 sm:mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-700 text-xs sm:text-sm">Overall Progress</span>
                        <span className={`text-xl sm:text-2xl font-bold ${getProgressTextColor(progressPercentage)} transition-colors duration-300`}>
                            {progressPercentage}%
                        </span>
                    </div>

                    <div className="relative">
                        <div className="bg-slate-200 rounded-full w-full h-3 overflow-hidden">
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
                            className={`absolute top-1/2 w-4 h-4 bg-white border-2 border-teal-500 rounded-full transform -translate-y-1/2 transition-all duration-1000 ease-out shadow-md`}
                            style={{ left: `calc(${animatedProgress}% - 8px)` }}
                        ></div>
                    </div>
                </div>

                {/* Stats */}
                <div className="gap-3 sm:gap-4 grid grid-cols-1 sm:grid-cols-2">
                    {/* Completed Tasks */}
                    <div className="flex items-center gap-3 bg-teal-50 p-3 sm:p-4 border border-teal-100 rounded-xl">
                        <div className="bg-teal-100 p-2 rounded-full">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                        </div>
                        <div>
                            <p className="font-medium text-teal-600 text-xs sm:text-sm">Completed</p>
                            <p className="font-bold text-teal-700 text-xl sm:text-2xl">{completedTasks}</p>
                        </div>
                    </div>

                    {/* Remaining Tasks */}
                    <div className="flex items-center gap-3 bg-slate-50 p-3 sm:p-4 border border-slate-200 rounded-xl">
                        <div className="bg-slate-100 p-2 rounded-full">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-600 text-xs sm:text-sm">Remaining</p>
                            <p className="font-bold text-slate-700 text-xl sm:text-2xl">{remainingTasks}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodayProgress;