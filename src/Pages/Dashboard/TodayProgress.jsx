import React, { useState, useEffect } from 'react';
import { Target, Trophy, Zap, Star, RefreshCw } from 'lucide-react';
import { useTasks } from '../../context/TaskProvider';

const TodayProgress = () => {
    const { tasks } = useTasks();
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

    // Helper function to get tasks for today only
    const getTodayTasks = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        return tasks.filter(task => {
            const startDate = new Date(task.start_date);
            startDate.setHours(0, 0, 0, 0);

            const dueDate = new Date(task.due_date);
            dueDate.setHours(23, 59, 59, 999); // End of the due date

            // Check if today falls between start and due dates
            // and task is not completed (for active tasks)
            return startDate <= today &&
                today <= dueDate &&
                task.status.toLowerCase() !== 'completed';
        });
    };

    const todaysTasks = getTodayTasks();
    const currentTask = todaysTasks[currentTaskIndex];

    // Generate motivational quote for the current TODAY'S task
    const generateTaskMotivation = async () => {
        if (!currentTask) {
            setQuote({
                text: "Your schedule is clear for today - perfect time to plan ahead!",
                author: "TaskMate"
            });
            return;
        }

        setLoading(true);
        setError(null);

        const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

        try {
            // Calculate time progress
            const timeSpent = currentTask.timeSpent || 0;
            const estimatedDuration = currentTask.estimatedDuration || 60; // default 60 minutes
            const progressPercent = Math.min(Math.round((timeSpent / (estimatedDuration * 60)) * 100), 100);

            // Calculate time remaining
            const now = new Date();
            const dueDate = new Date(currentTask.due_date);
            const hoursRemaining = Math.max(0, Math.round((dueDate - now) / (1000 * 60 * 60)));

            const prompt = `
            Create ONE short motivational message (1-2 sentences) for this active task.
            Rules:
            1. Keep it energetic and actionable
            2. Focus on the time remaining: ${hoursRemaining} hours left
            3. Include progress if available: ${progressPercent}% complete
            4. Current status: ${currentTask.status}
            5. Make it urgent but encouraging
            
            Task:
            - Title: ${currentTask.title}
            - Description: ${currentTask.description || "No description"}
            - Progress: ${progressPercent}% complete
            - Hours remaining: ${hoursRemaining}
            
            Respond with only the motivational message, no other text.
            `;

            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 100,
                },
            };

            const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            setQuote({
                text: text.trim(),
                author: currentTask.title,
                taskId: currentTask.id // Store task ID to track which task this is for
            });

        } catch (err) {
            setError("Failed to generate motivation.");
            console.error(err);

            // Updated fallback motivation based on time remaining
            const dueDate = new Date(currentTask.due_date);
            const hoursLeft = Math.round((dueDate - new Date()) / (1000 * 60 * 60));

            const fallbackText = hoursLeft < 24
                ? `Final stretch for "${currentTask.title}"! Just ${hoursLeft} hours to go - you've got this! 🚀`
                : `Time to focus on "${currentTask.title}"! Make progress today for success tomorrow! 💪`;

            setQuote({
                text: fallbackText,
                author: currentTask.title,
                taskId: currentTask.id
            });
        } finally {
            setLoading(false);
        }
    };

    // Rotate through TODAY'S tasks for motivation
    const rotateTask = () => {
        if (todaysTasks.length <= 1) return;
        setCurrentTaskIndex((prev) => (prev + 1) % todaysTasks.length);
    };

    useEffect(() => {
        if (todaysTasks.length > 0) {
            generateTaskMotivation();
        } else {
            setQuote({
                text: "No tasks scheduled for today - enjoy the freedom or plan something new!",
                author: "TaskMate"
            });
        }
    }, [currentTaskIndex, todaysTasks.length]);

    useEffect(() => {
        // Reset index when today's tasks change
        setCurrentTaskIndex(0);
    }, [todaysTasks.length]);

    // Calculate progress for TODAY'S tasks only
    const getProgressStats = () => {
        const todayTasks = getTodayTasks();
        const completedTasks = tasks.filter(task => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const startDate = new Date(task.start_date);
            startDate.setHours(0, 0, 0, 0);

            const dueDate = new Date(task.due_date);
            dueDate.setHours(23, 59, 59, 999);

            return startDate <= today &&
                today <= dueDate &&
                task.status.toLowerCase() === 'completed';
        });

        const totalTasks = todayTasks.length + completedTasks.length;
        const inProgress = todayTasks.filter(task => task.status.toLowerCase() === 'in_progress').length;
        const pending = todayTasks.filter(task => task.status.toLowerCase() === 'pending').length;
        const completed = completedTasks.length;

        return {
            total: totalTasks,
            active: todayTasks.length,
            completed,
            inProgress,
            pending,
            progressPercentage: totalTasks > 0
                ? Math.round(((completed + inProgress) / totalTasks) * 100)
                : 0
        };
    };

    const stats = getProgressStats();

    // Animate progress bar
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(stats.progressPercentage);
        }, 300);
        return () => clearTimeout(timer);
    }, [stats.progressPercentage]);

    const getProgressColor = (percentage) => {
        if (percentage >= 75) return 'from-green-500 to-green-600';
        if (percentage >= 50) return 'from-teal-500 to-teal-600';
        if (percentage >= 25) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    const getProgressMessage = (stats) => {
        if (stats.total === 0) return "No tasks scheduled for today";
        if (stats.completed === stats.total) return "All tasks completed! Amazing work! 🎉";
        if (stats.inProgress === 0 && stats.pending > 0) return "Time to start today's tasks! 🎯";

        const remainingCount = stats.total - stats.completed;
        return `${stats.completed} completed, ${remainingCount} to go! 💪`;
    };

    return (
        <div className="bg-white/80 shadow-lg backdrop-blur-sm mb-6 sm:mb-8 p-6 sm:p-8 border border-white/20 rounded-3xl">
            <div className="gap-6 lg:gap-8 grid grid-cols-1 lg:grid-cols-2">

                {/* Left Side - Today's Progress */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg p-3 rounded-2xl">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-xl">Today's Progress</h3>
                            <p className="text-gray-600 text-sm">{getProgressMessage(stats)}</p>
                        </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-left">
                            <span className="font-bold text-teal-600 text-3xl">
                                {stats.progressPercentage}%
                            </span>
                            <p className="text-gray-500 text-sm">
                                {stats.completed} of {stats.total} tasks completed
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="font-semibold text-gray-700 text-lg">
                                {stats.total - stats.completed}
                            </span>
                            <p className="text-gray-500 text-sm">
                                tasks remaining
                            </p>
                        </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="relative">
                        <div className="bg-gray-200 shadow-inner rounded-full w-full h-4 overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getProgressColor(stats.progressPercentage)} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                                style={{ width: `${animatedProgress}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        <div
                            className={`absolute top-1/2 w-5 h-5 bg-white border-3 ${stats.progressPercentage > 0 ? 'border-teal-500' : 'border-gray-400'} rounded-full transform -translate-y-1/2 transition-all duration-1000 ease-out shadow-lg`}
                            style={{ left: `calc(${animatedProgress}% - 10px)` }}
                        >
                            {stats.progressPercentage === 100 && (
                                <Trophy className="top-1/2 left-1/2 absolute w-3 h-3 text-yellow-500 -translate-x-1/2 -translate-y-1/2 transform" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Dynamic Motivational Content */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-md p-3 rounded-2xl">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-xl">Today's Motivation</h3>
                                <p className="text-gray-500 text-sm">
                                    {currentTask ? `Task: ${currentTask.title}` : "No tasks today"}
                                    {todaysTasks.length > 1 && ` (${currentTaskIndex + 1}/${todaysTasks.length})`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={rotateTask}
                            className="hover:bg-gray-100 p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            title="Next task"
                            disabled={todaysTasks.length <= 1}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Quote Card */}
                    {loading ? (
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg p-6 rounded-2xl animate-pulse">
                            <div className="space-y-3">
                                <div className="bg-gray-300 rounded w-3/4 h-4"></div>
                                <div className="bg-gray-300 rounded w-1/2 h-4"></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg p-6 border border-red-200 rounded-2xl">
                            <p className="text-red-600 text-sm">{error}</p>
                            <button
                                onClick={generateTaskMotivation}
                                className="mt-2 text-red-500 hover:text-red-700 text-xs underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : quote ? (
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg hover:shadow-xl p-6 rounded-2xl text-white transition-all duration-300 transform">
                            <div className="relative">
                                <blockquote className="z-10 relative mb-4 font-medium text-lg leading-relaxed">
                                    "{quote.text}"
                                </blockquote>
                                <cite className="opacity-90 font-medium text-sm">
                                    For: {quote.author}
                                </cite>
                            </div>
                        </div>
                    ) : null}

                    {/* Energy Boost Section */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border border-amber-100 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-amber-600" />
                            <div>
                                <p className="font-semibold text-gray-700 text-sm">
                                    Today's Energy Boost!
                                </p>
                                <p className="text-gray-500 text-xs">
                                    {stats.completed === stats.total
                                        ? "Fantastic! You've completed all tasks for today! 🎉"
                                        : stats.completed > 0
                                            ? `Great progress! ${stats.total - stats.completed} tasks remaining! 🚀`
                                            : `Let's tackle these ${stats.total} tasks together! 💪`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodayProgress;