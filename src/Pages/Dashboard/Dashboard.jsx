import React from 'react'
import TaskCard from './TaskCard'
import TodayProgress from './TodayProgress';

const Dashboard = () => {
    return (
        <div>
            <h3>
                Dashboard
            </h3>
            <TodayProgress />
            <TaskCard />
        </div>
    )
}

export default Dashboard;
