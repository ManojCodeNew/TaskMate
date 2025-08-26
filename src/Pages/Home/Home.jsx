import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import TaskMateLogo from '../../assets/TaskMateLogo.png';

const Home = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="flex flex-col justify-center items-center bg-gradient-to-br from-slate-200 via-blue-100 to-slate-300 p-4 min-h-screen overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="top-10 right-10 absolute bg-slate-400 opacity-20 rounded-full w-32 h-32 animate-pulse"></div>
        <div className="bottom-20 left-10 absolute bg-teal-600 opacity-20 rounded-full w-24 h-24 animate-bounce"></div>
        <div className="top-40 left-40 absolute bg-blue-300 opacity-10 rounded-full w-64 h-64 animate-[pulse_4s_infinite]"></div>
      </div>

      {/* Hero Content */}
      <div className="z-10 relative mx-auto max-w-4xl text-center">
        <img 
          src={TaskMateLogo} 
          alt="TaskMate Logo" 
          className="mx-auto mb-6 w-32 h-32 animate-[fadeIn_1s_ease-in]"
        />
        <h1 className="mb-6 font-bold text-slate-800 text-5xl md:text-7xl animate-[fadeIn_1s_ease-in_0.2s_both]">
          Welcome to TaskMate
        </h1>
        <p className="mb-12 text-slate-600 text-xl md:text-2xl animate-[fadeIn_1s_ease-in_0.4s_both]">
          Your daily productivity partner. Manage tasks, track progress, and achieve more.
        </p>

        {isSignedIn ? (
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg px-8 py-4 rounded-full font-medium text-white hover:scale-105 transition-all animate-[fadeIn_1s_ease-in_0.6s_both] duration-300"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        ) : (
          <div className="flex md:flex-row flex-col justify-center gap-4 animate-[fadeIn_1s_ease-in_0.6s_both]">
            <Link 
              to="/sign-in" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 shadow-lg px-6 py-3 rounded-full font-medium text-white hover:scale-105 transition-all duration-300"
            >
              <LogIn className="w-5 h-5" /> Login
            </Link>
            <Link 
              to="/sign-up" 
              className="inline-flex items-center gap-2 bg-white shadow-lg px-6 py-3 border border-teal-200 rounded-full font-medium text-teal-700 hover:scale-105 transition-all duration-300"
            >
              <UserPlus className="w-5 h-5" /> Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Custom Animation Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Home;