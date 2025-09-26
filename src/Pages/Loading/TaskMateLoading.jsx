import React from 'react';

const TaskMateLoading = ({ message = "Loading ...", description = "Please wait while we fetch the task information" }) => {
    return (
        <div className="mx-auto p-6 max-w-4xl">
            <div className="bg-white shadow-lg p-12 border border-gray-100 rounded-2xl">
                {/* Loading animation container */}
                <div className="flex flex-col items-center">
                    {/* Blinking Eye Loader */}
                    <div className="relative mb-6">
                        <div className="blinking-eye"></div>
                    </div>

                    {/* Loading text */}
                    <div className="space-y-3 text-center">
                        <h3 className="font-semibold text-gray-900 text-xl">
                            {message}
                        </h3>
                        <p className="text-gray-500">{description}</p>
                    </div>
                </div>
            </div>

            {/* CSS Animation Styles */}
            <style jsx>{`
                .blinking-eye {
                    width: 60px;
                    height: 60px;
                    border: 6px solid #2F6F6A;
                    background-color: transparent;
                    border-radius: 50%;
                    animation: blink 1s infinite ease-in-out;
                }

                @keyframes blink {
                    0%, 100% {
                        transform: scaleY(1);
                        border-radius: 50%;
                    }
                    50% {
                        transform: scaleY(0.5);
                        border-radius: 50px;
                    }
                }
            `}</style>
        </div>
    );
};

export default TaskMateLoading;