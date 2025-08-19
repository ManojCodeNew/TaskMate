import {
    FaArrowLeft,
    FaBars,
    FaPlus,
    FaPaintBrush,
    FaRobot,
    FaMicrophone,
    FaTachometerAlt,
    FaClock,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Menu = ({ isOpen, setIsOpen }) => {
    const menuItems = [
        { label: "Dashboard", icon: <FaTachometerAlt />, to: "/dashboard" },
        { label: "Add Task", icon: <FaPlus />, to: "/add-task" },
        { label: "Drawing Tool", icon: <FaPaintBrush />, to: "/drawing-tool" },
        { label: "AI Assistant", icon: <FaRobot />, to: "/ai-assistant" },
        { label: "Voice Notes", icon: <FaMicrophone />, to: "/voice-notes" },
        { label: "Timer", icon: <FaClock />, to: "/timer" },
    ];

    return (
        <>
            {/* Sidebar (all screens) */}
            <div
                className={`fixed top-[60px] sm:top-[72px] left-0 h-[calc(100vh-60px)] sm:h-[calc(100vh-72px)] 
        w-64 bg-gradient-to-r from-slate-50 to-slate-100 shadow-lg border-r border-slate-300 z-40 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Close button */}
                <div className="md:hidden flex justify-end p-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-slate-700 hover:text-slate-900"
                    >
                        <FaArrowLeft />
                    </button>
                </div>

                {/* Menu Items */}
                <ul className="space-y-3 px-4 pt-4">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                to={item.to}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 hover:bg-teal-100 p-3 rounded-lg text-slate-800 hover:text-teal-700 transition-all duration-200"
                            >
                                <span className="text-base">{item.icon}</span>
                                <span className="font-medium text-base">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Overlay (mobile only) */}
            {isOpen && (
                <div
                    className="md:hidden z-30 fixed inset-0 bg-black/40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Menu;
