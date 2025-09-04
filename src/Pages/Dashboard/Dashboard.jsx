import React from 'react';
import TaskCard from './TaskCard';
import TodayProgress from './TodayProgress';
import { Link } from 'react-router-dom';
import { Plus, Calendar, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 min-h-screen">
            {/* Main Content Container */}
            <div className="flex-1 mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                {/* Enhanced Dashboard Header */}
                <div className='bg-white/80 shadow-lg backdrop-blur-sm mb-6 sm:mb-8 p-6 sm:p-8 border border-white/20 rounded-3xl'>
                    <div className='flex sm:flex-row flex-col justify-between items-start sm:items-center gap-6'>
                        <div className='flex items-center gap-4'>
                            <div className="bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg p-3 rounded-2xl">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className='bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 font-bold text-slate-800 text-2xl sm:text-3xl'>
                                    Dashboard
                                </h1>
                                <p className="mt-1 text-slate-600 text-sm">
                                    {new Date().toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>
                        </div>
                        
                        <div className='flex items-center gap-3 w-full sm:w-auto'>
                            <Link
                                className='group flex flex-1 sm:flex-none justify-center items-center gap-2 bg-gradient-to-r from-teal-600 hover:from-teal-700 to-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl px-6 py-3 rounded-2xl font-semibold text-white text-sm hover:scale-105 transition-all duration-300 transform'
                                to={'/add-task'}
                            >
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                <span className="hidden sm:inline">Add New Task</span>
                                <span className="sm:hidden">Add Task</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Progress Section with Enhanced Styling */}
                <div className="mb-6 sm:mb-8">
                    <TodayProgress />
                </div>

                {/* Quick Stats Cards */}
                <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-3 mb-6 sm:mb-8">
                    <div className="bg-white/80 shadow-lg hover:shadow-xl backdrop-blur-sm p-6 border border-white/20 rounded-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-2xl">12</p>
                                <p className="text-slate-600 text-sm">Pending Tasks</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 shadow-lg hover:shadow-xl backdrop-blur-sm p-6 border border-white/20 rounded-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-2xl">8</p>
                                <p className="text-slate-600 text-sm">Completed</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 shadow-lg hover:shadow-xl backdrop-blur-sm p-6 border border-white/20 rounded-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-3 rounded-xl">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-2xl">75%</p>
                                <p className="text-slate-600 text-sm">Weekly Goal</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks Section with Enhanced Header */}
                <div className="bg-white/80 shadow-lg backdrop-blur-sm p-6 sm:p-8 border border-white/20 rounded-3xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="flex items-center gap-3 font-bold text-slate-800 text-xl sm:text-2xl">
                            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-2 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            Your Tasks
                        </h2>
                        <div className="flex gap-2">
                            <button className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl font-medium text-slate-700 text-sm transition-colors">
                                All
                            </button>
                            <button className="bg-teal-100 px-4 py-2 rounded-xl font-medium text-teal-700 text-sm">
                                Today
                            </button>
                        </div>
                    </div>
                    
                    {/* TaskCard Component */}
                    <TaskCard />
                </div>

                {/* Decorative Elements */}
                <div className="top-20 right-10 -z-10 fixed bg-gradient-to-r from-teal-200/30 to-blue-200/30 blur-3xl rounded-full w-32 h-32"></div>
                <div className="bottom-20 left-10 -z-10 fixed bg-gradient-to-r from-blue-200/30 to-purple-200/30 blur-3xl rounded-full w-40 h-40"></div>
            </div>
        </div>
    );
};

export default Dashboard;