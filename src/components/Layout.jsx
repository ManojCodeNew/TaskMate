import React, { useState } from "react";
import NavBar from "./NavBar";
import Menu from "./Menu";

const Layout = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative bg-gradient-to-br from-slate-200 via-blue-100 to-slate-300 min-h-screen">
            {/* Sidebar */}
            <Menu isOpen={isOpen} setIsOpen={setIsOpen} />

            {/* Navbar */}
            <div className="top-0 right-0 left-0 z-30 fixed h-[60px] sm:h-[72px]">
                <NavBar toggleMenu={() => setIsOpen(!isOpen)} />
            </div>

            {/* Main Content */}
            <div className="p-4 pt-[60px] sm:pt-[72px]">
                {children}
            </div>
        </div>
    );
};

export default Layout;
