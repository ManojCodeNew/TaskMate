import React, { useState } from 'react'
import { FiMenu, FiBell, FiSun, FiMoon } from 'react-icons/fi';
import Logo from '/logo_nobg_2.png';
const Navbar = () => {
    const [theme, setTheme] = useState(false);
    const ThemeChanger = () => {
        if (theme) {
            setTheme(false)
        } else {
            setTheme(true)
        }
    }
    return (
        <header className={`flex justify-between items-center ${theme ? 'bg-amber-50' : 'bg-gray-600'} shadow-md px-4 py-3 w-full`}>
            {/* Left Side: Logo + App Name */}
            <div className="flex items-center gap-2">
                <img
                    src={Logo}
                    alt="TM-Logo"
                    className="w-20 h-15 object-contain"
                    style={{ filter: 'drop-shadow(0 0 8px white)' }}
                />
                <span className="font-bold text-blue-600 text-2xl">
                    TaskMate
                </span>
            </div>

            {/* Right Side: Icons */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button className="hover:bg-gray-100 p-2 rounded-full" onClick={ThemeChanger}>
                    <FiSun className="text-gray-700 text-xl" />
                </button>

                {/* Notification */}
                <button className="relative hover:bg-gray-100 p-2 rounded-full" >
                    <FiBell className="text-gray-700 text-xl" />
                    <span className="top-1 right-1 absolute bg-red-500 rounded-full w-2 h-2"></span>
                </button>

                {/* User Avatar */}
                <div className="flex justify-center items-center bg-blue-500 rounded-full w-8 h-8 font-bold text-white text-sm">
                    M
                </div>
            </div>
        </header>
    )
}
export default Navbar;