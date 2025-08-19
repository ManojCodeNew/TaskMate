import React, { useState, useEffect } from "react";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
    useUser,
} from "@clerk/clerk-react";
import { FaBars } from "react-icons/fa";  // added
import TaskMateLogo from "../assets/TaskMateLogo.png";

function NavBar({ toggleMenu }) {   // receive toggleMenu from Layout
    const [isScrolled, setIsScrolled] = useState(false);
    const { user } = useUser(); // get user details from Clerk

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-lg border-b border-gray-200 supports-[backdrop-filter]:bg-white/60 ${isScrolled ? "bg-white/95 shadow-lg" : "bg-white/80 shadow-md"
                }`}
        >
            <div className="flex justify-between items-center mx-auto px-9 sm:px-6 py-4 sm:py-3 max-w-7xl">
                {/* Left: Menu button + Logo */}
                <div className="flex items-center gap-3 min-w-0">
                    {/* Menu button (desktop + mobile) */}
                    <button onClick={toggleMenu} className="p-2 rounded-md text-slate-700 hover:text-slate-900">
                        <FaBars size={20} />
                    </button>
                    {/* Logo + Name */}
                    <div className="flex items-center gap-2">
                        <div className="flex flex-shrink-0 justify-center items-center rounded-full w-8 sm:w-10 h-8 sm:h-10">
                            <img
                                src={TaskMateLogo}
                                alt="TaskMateLogo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-semibold text-slate-800 text-sm sm:text-base lg:text-lg truncate">
                                TaskMate
                            </h1>
                            <p className="hidden sm:block -mt-0.5 text-[10px] text-slate-600 sm:text-xs lg:text-sm truncate">
                                Your daily productivity partner
                            </p>
                        </div>
                    </div>
                </div>

                {/* Center: Date (only on md+) */}
                <div className="hidden md:block">
                    <span className="bg-white/80 shadow-sm px-2 sm:px-3 py-1 sm:py-1.5 border border-slate-200 rounded-full text-slate-700 text-xs sm:text-sm">
                        {today}
                    </span>
                </div>

                {/* Right: Auth buttons */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="bg-gradient-to-r from-teal-600 to-teal-700 shadow px-2 sm:px-4 py-1 sm:py-2 rounded-md font-medium text-white text-xs sm:text-sm hover:scale-105 transition-transform">
                                <span className="hidden sm:inline">Sign In</span>
                                <span className="sm:hidden">Login</span>
                            </button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <div className="flex items-center gap-2">
                            <UserButton />
                            <span className="max-w-[80px] sm:max-w-none font-medium text-slate-700 text-sm sm:text-base truncate">
                                {user?.fullName ||
                                    user?.firstName ||
                                    user?.primaryEmailAddress?.emailAddress}
                            </span>
                        </div>
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}

export default NavBar;
