import React from 'react';
import { Loader2 } from 'lucide-react';

const TaskMateLoading = ({ message = "Loading task details", description = "Please wait while we fetch the task information" }) => {
    return (
        <div className="mx-auto p-6 max-w-4xl">
            <div className="bg-white shadow-lg p-12 border border-gray-100 rounded-2xl">
                {/* Loading animation container */}
                <div className="flex flex-col items-center">
                    {/* Spinner with outer glow */}
                    <div className="relative mb-6">
                        {/* Pulsing background circle */}
                        <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
                        
                        {/* Spinning circle */}
                        <div className="relative flex justify-center items-center bg-gradient-to-tr from-blue-500 to-blue-600 rounded-full w-24 h-24">
                            <div className="absolute inset-0.5 bg-white rounded-full"></div>
                            <Loader2 className="z-10 relative w-12 h-12 text-blue-600 animate-spin" />
                        </div>
                        
                        {/* Decorative dots */}
                        <div className="-top-1 right-0 absolute bg-blue-400 rounded-full w-3 h-3 animate-bounce"></div>
                        <div className="bottom-0 left-0 absolute bg-blue-300 rounded-full w-2 h-2 animate-bounce delay-150"></div>
                    </div>

                    {/* Loading text with shimmer effect */}
                    <div className="space-y-3 text-center">
                        <h3 className="relative font-semibold text-gray-900 text-xl">
                            {message}
                            <div className="bottom-0 left-0 absolute bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full h-0.5 animate-shimmer"></div>
                        </h3>
                        <p className="text-gray-500">{description}</p>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-8 w-full max-w-md">
                        <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-4/5 h-full animate-progressBar"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskMateLoading;