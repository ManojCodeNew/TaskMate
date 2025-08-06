import { useState } from "react";
import { FaArrowLeft, FaBars } from "react-icons/fa";

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);

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

        {/* Menu Content */}
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-xl font-bold">Menu</h1>
          {/* Add your menu items here */}
        </div>
      </div>

      {/* Toggle Button (when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-18 left-4 z-50 p-2 bg-white rounded-md shadow-md text-gray-700 hover:text-black"
          title="Open Menu"
        >
          <FaBars />
        </button>
      )}
    </>
  );
};

export default Menu;
