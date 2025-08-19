import React from 'react'
import TaskCard from './TaskCard'
import TodayProgress from './TodayProgress';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="flex-1 bg-slate-50 p-4 sm:p-6 overflow-auto">
            {/* Dashboard Header */}
            <div className='flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 bg-white shadow-sm p-4 sm:p-6 rounded-md'>
                <h3 className='font-bold text-slate-800 text-xl sm:text-2xl'>
                    Dashboard
                </h3>
                <div className='flex items-center gap-2 sm:gap-4 w-full sm:w-auto'>
                    <Link
                        className='flex-1 sm:flex-none bg-gradient-to-r from-teal-600 to-teal-700 shadow px-3 sm:px-4 py-2 rounded-md font-medium text-white text-xs sm:text-sm text-center hover:scale-105 transition-transform'
                        to={'/add-task'}
                    >
                        <span className="hidden sm:inline">+ Add New Task</span>
                        <span className="sm:hidden">+ Add Task</span>
                    </Link>
                </div>
            </div>

            {/* Progress Section */}
            <TodayProgress />

            {/* Tasks Section */}
            <TaskCard />
        </div>
    )
}

export default Dashboard;
