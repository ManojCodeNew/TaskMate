import React from 'react'
import TaskCard from './TaskCard'
import TodayProgress from './TodayProgress';

const Dashboard = () => {
    return (
        <div>
            <div className='flex justify-between items-center p-6  '>
                <h3 className='text-2xl font-bold'>
                    Dashboard
                </h3>
                <div className='flex items-center gap-4'>
                    <button className='bg-gradient-to-r from-purple-500 to-purple-600 shadow px-4 py-2 rounded-md font-medium text-white text-sm hover:scale-105 transition-transform'>
                        + Add New Task
                    </button>
                </div>
            </div>
            <div className='space-y-6  p-6 max-w-md'>
                <TodayProgress />
            </div>
            <TaskCard />
        </div>
    )
}

export default Dashboard;
