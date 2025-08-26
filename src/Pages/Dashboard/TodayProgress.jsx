import React, { useState, useEffect } from 'react';
import { Target, Trophy } from 'lucide-react';
import { useTasks } from '../../context/TaskProvider';

const TodayProgress = () => {   
    const { tasks } = useTasks();
    const [animatedProgress, setAnimatedProgress] = useState(0);

    // Helper function to get tasks for today
    const getTodayTasks = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return tasks.filter(task => {
            const dueDate = new Date(task.due_date);
            const startDate = new Date(task.start_date);
            
            return (
                (dueDate >= today && dueDate < tomorrow) ||
                (startDate >= today && startDate < tomorrow) ||
                (dueDate < today && task.status !== 'completed')
            );
        });
    };

    const todaysTasks = getTodayTasks();

    // Calculate progress for today's tasks only
    const completedTasks = todaysTasks.filter(task => task.status === 'completed').length;
    const totalTasks = todaysTasks.length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Animate progress bar
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(progressPercentage);
        }, 300);
        return () => clearTimeout(timer);
    }, [progressPercentage]);

    const getProgressColor = (percentage) => {
        if (percentage >= 75) return 'from-green-500 to-green-600';
        if (percentage >= 50) return 'from-teal-500 to-teal-600';
        if (percentage >= 25) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    const getProgressMessage = (percentage) => {
        if (percentage === 100) return "All tasks completed! 🎉";
        if (percentage >= 75) return "Great progress! Keep going! 💪";
        if (percentage >= 50) return "Halfway there! 👍";
        if (percentage >= 25) return "Making progress! 🚀";
        if (totalTasks === 0) return "No tasks scheduled for today";
        return "Let's get started! 🎯";
    };

    return (
        <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-2 rounded-full">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Today's Progress</h3>
                        <p className="text-gray-600 text-sm">{getProgressMessage(progressPercentage)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="font-bold text-teal-600 text-2xl">{progressPercentage}%</span>
                    <p className="text-gray-500 text-sm">{completedTasks} of {totalTasks} tasks</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="bg-gray-200 rounded-full w-full h-3 overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(progressPercentage)} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                        style={{ width: `${animatedProgress}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                </div>

                {/* Progress indicator */}
                <div
                    className={`absolute top-1/2 w-4 h-4 bg-white border-2 ${progressPercentage > 0 ? 'border-teal-500' : 'border-gray-400'} rounded-full transform -translate-y-1/2 transition-all duration-1000 ease-out shadow-lg`}
                    style={{ left: `calc(${animatedProgress}% - 8px)` }}
                >
                    {progressPercentage === 100 && (
                        <Trophy className="top-1/2 left-1/2 absolute w-2.5 h-2.5 text-yellow-500 -translate-x-1/2 -translate-y-1/2 transform" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodayProgress;