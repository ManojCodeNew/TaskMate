import React, { useState } from 'react';
import { FiBell, FiSun, FiMoon } from 'react-icons/fi';
import { FaRegCalendarAlt } from 'react-icons/fa';

function NavBar() {
    const [theme, setTheme] = useState(false);

    const ThemeChanger = () => setTheme(!theme);

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    return (
        <header
            className={'sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-300 shadow-sm bg-gradient-to-r from-[#e3eaf0] to-[#e3eaf0]'
            }>
            <div className="flex justify-between items-center mx-auto px-4 py-3 max-w-7xl">
                {/* Left: Logo + Name */}
                <div className="flex items-center gap-3">
                    {/* <div className="bg-purple-500 shadow-md p-2 rounded-xl text-white text-lg">
                        <FaRegCalendarAlt />
                    </div> */}
                    <div>
                        <h1 className="font-semibold text-gray-900 text-lg">TaskMate</h1>
                        <p className="-mt-1 text-gray-700 text-sm">Your daily productivity partner</p>
                    </div>
                </div>

                {/* Center: Date */}
                <div className="hidden md:block">
                    <span className="bg-white shadow-sm px-3 py-1 rounded-full text-gray-700 text-sm">
                        {today}
                    </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button onClick={ThemeChanger} className="hover:bg-white p-2 rounded-full transition-colors">
                        {theme
                            ? <FiMoon className="text-gray-700 text-xl" />
                            : <FiSun className="text-yellow-500 text-xl" />}
                    </button>

                    {/* Notification Icon */}
                    <button className="relative hover:bg-white p-2 rounded-full">
                        <FiBell className="text-gray-700 text-xl" />
                        <span className="top-1 right-1 absolute bg-red-500 rounded-full w-2 h-2"></span>
                    </button>

                    {/* Add Task Button */}
                    <button className="bg-gradient-to-r from-purple-500 to-purple-600 shadow px-4 py-2 rounded-md font-medium text-white text-sm hover:scale-105 transition-transform">
                        + Add New Task
                    </button>

                    {/* User Avatar */}
                    <div className="flex justify-center items-center bg-blue-500 rounded-full w-8 h-8 font-bold text-white text-sm">
                        M
                    </div>
                </div>
            </div>
        </header>
    );
}

export default NavBar;
