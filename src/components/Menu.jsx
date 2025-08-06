import { useState } from "react";
import { FaArrowLeft, FaBars, FaPlus, FaPaintBrush, FaRobot, FaMicrophone, FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";
const Menu = () => {
    const [isOpen, setIsOpen] = useState(false);

    // MenuBar Quick Links
    const menuItems = [
        { label: "Add Task", icon: <FaPlus />, to: "/add-task" },
        { label: "Drawing Tool", icon: <FaPaintBrush />, to: "/drawing-tool" },
        { label: "AI Assistant", icon: <FaRobot />, to: "/ai-assistant" },
        { label: "Voice Notes", icon: <FaMicrophone />, to: "/voice-notes" },
        { label: "Timer", icon: <FaClock />, to: "/timer" },
    ];

    return (
        <>
            {/* Sidebar Menu */}
            <div
                className={`fixed top-17 left-0 h-full w-64 bg-gradient-to-r from-[#e3eaf0] to-[#e3eaf0] shadow-lg border-r border-gray-400 z-50 
        transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Toggle Button inside the sidebar (top-right corner) */}
                <div className="flex justify-end p-2">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-700 hover:text-black text-lg p-2"
                        title={isOpen ? "Close Menu" : "Open Menu"}
                    >
                        <FaArrowLeft />
                    </button>
                </div>

                {/* Menu Items */}
                <ul className="px-4 space-y-4 pt-4">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                to={item.to}
                                className="flex items-center gap-3 p-3 rounded-lg text-gray-800 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200"
                                onClick={() => setIsOpen(false)} // Auto-close after click
                            >
                                <span>{item.icon}</span>
                                <span className="text-base font-medium">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Toggle Button (when sidebar is closed) */}
            {
                !isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="fixed top-18 left-4 z-50 p-2 bg-white rounded-md shadow-md text-gray-700 hover:text-black"
                        title="Open Menu"
                    >
                        <FaBars size={18}/>
                    </button>
                )
            }
        </>
    );
};

export default Menu;
