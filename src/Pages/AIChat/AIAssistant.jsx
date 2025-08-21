// import React, { useState } from 'react'

// function AIAssistant() {
//     const [prompt, setPrompt] = useState("HAI");
//     const payload = {
//         contents: [
//             {
//                 parts: [{ text: prompt }],
//             },
//         ],
//     }
//     const URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
//     const fetchAnswerFromGeminai = async () => {
//         const response = await fetch(`${URL}?key=AIzaSyC_0W8JKs3erwlTv5_rff4kVxsnXdp-nTw`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(
//                 payload)
//         });
//         const Answer = await response.json()
//         console.log("Response :", Answer.candidates[0].content.parts[0].text);

//     }


//     return (
//         <div>
//             <div>
//                 <input type="text" placeholder='Type QUESTION HERE' />
//             </div>
//             <div>
//                 <p onClick={fetchAnswerFromGeminai}>Answer</p>
//             </div>

//         </div>
//     )
// }

// export default AIAssistant
import React, { useState } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaClock } from "react-icons/fa";

const AIAssistant = () => {
    const [selectedTask, setSelectedTask] = useState(null);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            content: 'Hello! How can I assist you today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Sample tasks
    const tasks = [
        { id: 1, title: "Build React UI", description: "Create a user-friendly interface", progress: 40 },
        { id: 2, title: "Integrate API", description: "Connect backend services", progress: 60 },
        { id: 3, title: "Deploy App", description: "Deploy to production", progress: 20 }
    ];

    // Format Gemini response
    const formatGeminiResponse = (rawResponse) => {
        if (!rawResponse) return "I couldn't generate a response. Please try again.";

        let formatted = rawResponse.trim();
        // formatted = formatted.replace(/\n{3,}/g, '\n\n');  //  This will remove 3 or more space in between of two line replace with just 2 line space 
        // formatted = formatted.replace(/\s{3,}/g, ' '); //This will remove 3 or more space between words replace with 2 space 
        // formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // ** content makes bold
        // formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>'); // * content makes italic
        // formatted = formatted.replace(/```(.*?)```/gs, '<code>$1</code>'); // arrange code blocks
        return formatted.trim();
    };

    // Call Gemini API
    const callGeminiAPI = async (message) => {
        try {
            setIsLoading(true);
            setError(null);

            const payload = {
                contents: [
                    {
                        parts: [{ text: message }],
                    },
                ],
            };

            const URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

            const response = await fetch(`${URL}?key=AIzaSyC_0W8JKs3erwlTv5_rff4kVxsnXdp-nTw`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            const RawResponse = await response.json();
            const Answer = RawResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
            return formatGeminiResponse(Answer);

        } catch (error) {
            console.error('Gemini API Error:', error);
            setError('Failed to get response from AI.');
            return "Sorry, I had an issue connecting. Try again.";
        } finally {
            setIsLoading(false);
        }
    };

    const handleTaskSelect = (task) => {
        setSelectedTask(task);
        const assistantMessage = {
            id: messages.length + 1,
            type: 'assistant',
            content: `You selected "${task.title}". You're ${task.progress}% done. What would you like help with?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, assistantMessage]);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: inputMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        // Get AI response
        const aiResponse = await callGeminiAPI(inputMessage);

        const assistantMessage = {
            id: messages.length + 2,
            type: 'assistant',
            content: aiResponse,
            formatted: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMessage]);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const MessageContent = ({ content, formatted }) => {
        if (formatted) {
            return (
                <div
                    className="prose prose-sm"
                    dangerouslySetInnerHTML={{
                        __html: content.replace(/\n/g, '<br>')
                    }}
                />
            );
        }
        return <div className="whitespace-pre-wrap">{content}</div>;
    };

    return (
        <div className="flex bg-gray-50 h-screen">
            {/* Tasks Panel */}
            <div className="flex flex-col bg-white border-gray-200 border-r w-80">
                <div className="p-6 border-gray-200 border-b">
                    <h2 className="font-semibold text-gray-800 text-xl">TASKS</h2>
                </div>

                <div className="flex-1 space-y-4 p-4 overflow-y-auto">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => handleTaskSelect(task)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedTask?.id === task.id
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <h3 className="mb-2 font-semibold text-gray-800">{task.title}</h3>
                            <p className="mb-3 text-gray-600 text-sm">{task.description}</p>

                            <div className="bg-gray-200 rounded-full w-full h-2">
                                <div
                                    className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                                    style={{ width: `${task.progress}%` }}
                                ></div>
                            </div>
                            <div className="mt-1 text-gray-500 text-xs text-right">
                                {task.progress}% complete
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Assistant Panel */}
            <div className="flex flex-col flex-1">
                <div className="bg-white p-6 border-gray-200 border-b">
                    <h2 className="font-semibold text-gray-800 text-xl">ASSISTANT</h2>
                </div>

                <div className="flex-1 space-y-4 bg-gray-50 p-6 overflow-y-auto">
                    {error && (
                        <div className="bg-red-100 mb-4 p-3 border border-red-300 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex items-start space-x-2 max-w-4xl">
                                {message.type === 'assistant' && (
                                    <div className="flex justify-center items-center bg-blue-500 rounded-full w-8 h-8">
                                        <FaRobot className="text-white" />
                                    </div>
                                )}

                                <div className="flex flex-col">
                                    <div className={`px-4 py-3 rounded-lg ${message.type === 'user'
                                        ? 'bg-blue-500 text-white ml-12'
                                        : 'bg-white text-gray-800 border border-gray-200'
                                        }`}>
                                        <MessageContent content={message.content} formatted={message.formatted} />
                                    </div>
                                    <div className={`text-xs text-gray-500 mt-1 flex items-center ${message.type === 'user' ? 'justify-end ml-12' : 'justify-start'}`}>
                                        <FaClock className="mr-1" /> {message.timestamp}
                                    </div>
                                </div>

                                {message.type === 'user' && (
                                    <div className="flex justify-center items-center bg-gray-500 rounded-full w-8 h-8">
                                        <FaUser className="text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg text-gray-800">
                                <span className="text-gray-500 text-sm">AI is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="bg-white p-6 border-gray-200 border-t">
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={selectedTask ? `Ask about "${selectedTask.title}"...` : "Select a task and ask me anything..."}
                            disabled={isLoading}
                            className="flex-1 disabled:bg-gray-100 p-3 border focus:border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputMessage.trim()}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 p-3 rounded-lg text-white transition disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></div>
                            ) : (
                                <FaPaperPlane size={18} />
                            )}
                        </button>
                    </div>

                    {selectedTask && (
                        <div className="bg-blue-50 mt-3 p-2 rounded-lg text-gray-600 text-sm">
                            <strong>Current context:</strong> {selectedTask.title} ({selectedTask.progress}% complete)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
