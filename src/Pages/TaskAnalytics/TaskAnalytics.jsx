import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
    ResponsiveContainer, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { format, startOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { Duration } from 'luxon';
import { useTasks } from '../../context/TaskProvider';
import {
    CalendarDays, Clock, TrendingUp, BarChart2,
    PieChart as PieChartIcon
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TaskAnalytics = () => {
    const { tasks } = useTasks();
    const [view, setView] = useState('overview');

    // Update getTodayStats to include created tasks
    const getTodayStats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get tasks created today
        const createdToday = tasks.filter(task => {
            const creationDate = new Date(task.created_at);
            return creationDate >= today && creationDate < tomorrow;
        });

        // Get tasks completed today
        const completedToday = tasks.filter(task => {
            if (!task.completed_at) return false;
            const completionDate = new Date(task.completed_at);
            return completionDate >= today && completionDate < tomorrow;
        });

        // Get tasks due today or in future
        const relevantTasks = tasks.filter(task => {
            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today;
        });

        return {
            total: relevantTasks.length,
            completed: completedToday.length,
            created: createdToday.length,
            remaining: relevantTasks.length - completedToday.length
        };
    }, [tasks]);

    // Update getMonthlyData to include created tasks
    const getMonthlyData = useMemo(() => {
        const today = new Date();
        const monthStart = startOfMonth(today);

        const daysInMonth = eachDayOfInterval({
            start: monthStart,
            end: today
        });

        return daysInMonth.map(date => {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Count tasks created on this day
            const createdOnDay = tasks.filter(task => {
                const creationDate = new Date(task.created_at);
                return creationDate >= startOfDay && creationDate <= endOfDay;
            }).length;

            // Count tasks completed on this day
            const completedOnDay = tasks.filter(task => {
                if (!task.completed_at) return false;
                const completionDate = new Date(task.completed_at);
                return completionDate >= startOfDay && completionDate <= endOfDay;
            }).length;

            return {
                date: format(date, 'MMM dd'),
                created: createdOnDay,
                completed: completedOnDay,
                isToday: isToday(date)
            };
        });
    }, [tasks]);

    // Update prediction logic to use all historical completion data
    const getPredictionData = useMemo(() => {
        // Initialize hourly completion stats
        const hourlyStats = Array(24).fill(0).map((_, hour) => ({
            hour,
            completions: 0,
            totalDuration: 0
        }));

        // Get all completed tasks (entire history)
        const completedTasks = tasks.filter(task => 
            task.status.toLowerCase() === 'completed' && 
            task.completed_at && 
            task.timeSpent
        );

        // Process completion patterns
        completedTasks.forEach(task => {
            const completionDate = new Date(task.completed_at);
            const completionHour = completionDate.getHours();
            
            hourlyStats[completionHour].completions++;
            hourlyStats[completionHour].totalDuration += task.timeSpent || 0;
        });

        // Calculate average duration per hour
        const hourlyRates = hourlyStats.map(stat => ({
            hour: `${stat.hour}:00`,
            completions: stat.completions,
            avgDuration: stat.completions ? 
                Math.round(stat.totalDuration / stat.completions / 60) : 0
        }));

        // Find peak productivity hours (top 3)
        const productiveHours = [...hourlyStats]
            .sort((a, b) => b.completions - a.completions)
            .slice(0, 3)
            .map(stat => ({
                hour: `${stat.hour}:00`,
                completions: stat.completions,
                avgDuration: stat.completions ? 
                    Math.round(stat.totalDuration / stat.completions / 60) : 0
            }));

        // Calculate overall statistics
        const totalTimeSpent = completedTasks.reduce((acc, task) => 
            acc + (task.timeSpent || 0), 0);

        const averageCompletionTime = completedTasks.length ?
            Math.round(totalTimeSpent / completedTasks.length / 60) : 0;

        // Calculate completion rate over time
        const firstCompletion = completedTasks.length ? 
            new Date(Math.min(...completedTasks.map(t => new Date(t.completed_at)))) : 
            new Date();
        
        const daysSinceFirst = Math.max(1, 
            Math.ceil((new Date() - firstCompletion) / (1000 * 60 * 60 * 24))
        );

        return {
            hourlyRates,
            productiveHours,
            avgDuration: averageCompletionTime,
            totalCompleted: completedTasks.length,
            completionRate: tasks.length ? 
                (completedTasks.length / tasks.length) * 100 : 0,
            avgCompletionsPerDay: Math.round((completedTasks.length / daysSinceFirst) * 10) / 10
        };
    }, [tasks]);

    return (
        <div className="mt-4 sm:mt-6 p-4 sm:p-6"> {/* Adjusted padding and margin for mobile */}
            <div className="space-y-4 sm:space-y-6 bg-white shadow-lg p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                {/* View Selector - Make it scrollable on mobile */}
                <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
                    <h2 className="font-bold text-gray-800 text-xl sm:text-2xl">
                        Task Analytics
                    </h2>
                    <div className="flex gap-2 pb-2 sm:pb-0 sm:overflow-visible overflow-x-auto">
                        <button
                            onClick={() => setView('overview')}
                            className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 ${
                                view === 'overview'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <PieChartIcon className="w-4 h-4" />
                            <span className="text-sm sm:text-base">Overview</span>
                        </button>
                        <button
                            onClick={() => setView('monthly')}
                            className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 ${view === 'monthly'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <CalendarDays className="w-4 h-4" />
                            <span className="text-sm sm:text-base">Monthly</span>
                        </button>

                    </div>
                </div>

                {/* Overview View */}
                {view === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        {/* Stats Grid - Responsive columns */}
                        <div className="gap-3 sm:gap-4 grid grid-cols-2 md:grid-cols-4">
                            {/* Stats cards with adjusted padding */}
                            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="mb-1 sm:mb-2 font-medium text-blue-700 text-sm sm:text-base">
                                    Total Tasks Today
                                </h3>
                                <p className="font-bold text-blue-800 text-2xl sm:text-3xl">
                                    {getTodayStats.total}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="mb-1 sm:mb-2 font-medium text-purple-700 text-sm sm:text-base">
                                    Created Today
                                </h3>
                                <p className="font-bold text-purple-800 text-2xl sm:text-3xl">
                                    {getTodayStats.created}
                                </p>
                            </div>
                            <div className="bg-green-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="mb-1 sm:mb-2 font-medium text-green-700 text-sm sm:text-base">
                                    Completed Today
                                </h3>
                                <p className="font-bold text-green-800 text-2xl sm:text-3xl">
                                    {getTodayStats.completed}
                                </p>
                            </div>
                            <div className="bg-amber-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="mb-1 sm:mb-2 font-medium text-amber-700 text-sm sm:text-base">
                                    Remaining
                                </h3>
                                <p className="font-bold text-amber-800 text-2xl sm:text-3xl">
                                    {getTodayStats.remaining}
                                </p>
                            </div>
                        </div>

                        {/* Charts - Adjust height for different screens */}
                        <div className="h-60 sm:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{
                                    name: "Today's Tasks",
                                    created: getTodayStats.created,
                                    completed: getTodayStats.completed,
                                    remaining: getTodayStats.remaining
                                }]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="created" fill={COLORS[3]} name="Created" />
                                    <Bar dataKey="completed" fill={COLORS[1]} name="Completed" />
                                    <Bar dataKey="remaining" fill={COLORS[2]} name="Remaining" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {/* Monthly View */}
                {view === 'monthly' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-[60vh] sm:h-96"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getMonthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12 }}
                                    interval={'preserveStartEnd'}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar
                                    dataKey="created"
                                    fill={COLORS[3]}
                                    name="Created"
                                />
                                <Bar
                                    dataKey="completed"
                                    fill={COLORS[1]}
                                    name="Completed"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Prediction View */}
                {view === 'prediction' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        {/* Stats Grid - Responsive columns */}
                        <div className="gap-3 sm:gap-4 grid grid-cols-2 md:grid-cols-4">
                            {/* Stats cards with adjusted padding */}
                            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="mb-1 sm:mb-2 font-medium text-purple-700 text-sm sm:text-base">
                                    Average Duration
                                </h3>
                                <p className="font-bold text-purple-800 text-xl sm:text-3xl">
                                    {getPredictionData.avgDuration} min
                                </p>
                            </div>
                            <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="mb-1 sm:mb-2 font-medium text-indigo-700 text-sm sm:text-base">
                                    Total Completed
                                </h3>
                                <p className="font-bold text-indigo-800 text-xl sm:text-3xl">
                                    {getPredictionData.totalCompleted}
                                </p>
                            </div>
                            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="mb-1 sm:mb-2 font-medium text-blue-700 text-sm sm:text-base">
                                    Completion Rate
                                </h3>
                                <p className="font-bold text-blue-800 text-xl sm:text-3xl">
                                    {Math.round(getPredictionData.completionRate)}%
                                </p>
                            </div>
                            <div className="bg-teal-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                                <h3 className="mb-1 sm:mb-2 font-medium text-teal-700 text-sm sm:text-base">
                                    Daily Completions
                                </h3>
                                <p className="font-bold text-teal-800 text-xl sm:text-3xl">
                                    {getPredictionData.avgCompletionsPerDay}
                                </p>
                            </div>
                        </div>

                        {/* Charts Grid - Responsive layout */}
                        <div className="gap-4 grid grid-cols-1 lg:grid-cols-3">
                            <div className="lg:col-span-2 h-60 sm:h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={getPredictionData.hourlyRates}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="hour" 
                                            tick={{ fontSize: 12 }}
                                            interval={'preserveStartEnd'}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                        <Line
                                            type="monotone"
                                            dataKey="rate"
                                            stroke={COLORS[0]}
                                            name="Completion Rate %"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-teal-50 p-3 sm:p-4 rounded-lg sm:rounded-xl h-auto sm:h-80">
                                <h3 className="mb-2 font-medium text-teal-700 text-sm sm:text-base">
                                    Most Productive Hours
                                </h3>
                                <div className="space-y-2">
                                    {getPredictionData.productiveHours.map((hour, index) => (
                                        <div key={hour.hour} className="flex justify-between items-center">
                                            <span className="text-teal-600">{hour.hour}</span>
                                            <span className="font-medium text-teal-800">
                                                {hour.completions} tasks
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default TaskAnalytics;