import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import TaskMateLogo from '../assets/TaskMateLogo.png';

function NavBar() {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    return (
        <header className="top-0 z-50 sticky bg-white/70 shadow-sm backdrop-blur-md border-gray-200 border-b w-full transition-all duration-300">
            <div className="flex justify-between items-center mx-auto px-4 py-3 max-w-7xl">

                {/* Left: Logo + Name */}
                <div className="flex items-center gap-3">
                    <img
                        src={TaskMateLogo}
                        alt="TaskMate Logo"
                        className="w-10 h-10 object-contain"
                    />
                    <div className="">
                        <h1 className="font-semibold text-gray-900 text-lg">TaskMate</h1>
                        <p className="-mt-1 text-gray-700 text-sm md:text-2xl">Your daily productivity partner</p>
                    </div>
                </div>

                {/* Center: Date (hidden on mobile) */}
                <div className="hidden md:block">
                    <span className="bg-white/80 shadow-sm px-3 py-2 border border-gray-300 rounded-full text-gray-700 text-sm">
                        {today}
                    </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* Show Sign In if logged out */}
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="bg-gradient-to-r from-purple-500 to-purple-600 shadow px-4 py-2 rounded-md font-medium text-white text-sm hover:scale-105 transition-transform">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>

                    {/* Show Profile if logged in */}
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}

export default NavBar;
