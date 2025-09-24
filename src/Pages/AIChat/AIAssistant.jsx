import React, { useState, useRef } from 'react';
// Icon Providers
import { FaPaperPlane, FaRobot, FaUser, FaClock } from "react-icons/fa";
import { AlertCircle, Loader2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
// Authentication
import { useAuth } from '@clerk/clerk-react';
// Context
import { useTasks } from '../../context/TaskProvider.jsx';
// Markdown and Syntax Highlighting
import rehypeHighlight from "rehype-highlight";
import ReactMarkdown from "react-markdown";
import "highlight.js/styles/github.css"

const AIAssistant = () => {
    const { tasks, loading: tasksLoading, error: tasksError } = useTasks();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            content: 'Hello! How can I assist you today?',
            followUps: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // follow-up state
    const [showFollowUpInput, setShowFollowUpInput] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [followUpPrompt, setFollowUpPrompt] = useState('');
    const [activeMessageId, setActiveMessageId] = useState(null);
    const [activeLineId, setActiveLineId] = useState(null);
    const { userId } = useAuth();

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Format Gemini response
    const formatGeminiResponse = (rawResponse) => {
        if (!rawResponse) return "I couldn't generate a response. Please try again.";

        // First clean up extra whitespace
        let formatted = rawResponse.trim();
        formatted = formatted.replace(/\n{3,}/g, '\n\n');
        formatted = formatted.replace(/\s{3,}/g, ' ');

        return formatted;
    };

    // Call Gemini API
    const callGeminiAPI = async (message) => {
        try {
            setIsLoading(true);
            setError(null);

            // Create context-aware prompt
            const contextPrompt = selectedTask ? `
Context:
${JSON.stringify(selectedTask, null, 2)}

Previous messages:
${messages.slice(-3).map(m => `${m.type}: ${m.content}`).join('\n')}

User Query: ${message}

Instructions:
1. Consider the task context above
2. Reference task details when relevant
3. Provide specific, actionable advice
4. Include timeline considerations
5. Break down complex solutions into steps
6. Format response with markdown for readability
        `.trim() : message;

            const payload = {
                contents: [{ parts: [{ text: contextPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                },
            };

            const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
            const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

            const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const RawResponse = await response.json();
            const Answer = RawResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
            console.log("Raw Gemini Response:", Answer);

            if (!Answer) {
                throw new Error('Invalid API response structure');
            }

            // Format the response with proper markdown
            return formatGeminiResponse(Answer);

        } catch (error) {
            console.error('Gemini API Error:', error);
            setError('Failed to get response from AI.');
            return `I apologize, but I encountered an error. ${error.message}`;
        } finally {
            setIsLoading(false);
        }
    };



    const handleTaskSelect = (task) => {
        setSelectedTask(task);

        // Format task details for AI context
        const taskDetails = `
Task: ${task.title}
Description: ${task.description}
Status: ${task.status}
Priority: ${task.priority}
Start Date: ${new Date(task.start_date).toLocaleDateString()}
Due Date: ${new Date(task.due_date).toLocaleDateString()}
Estimated Duration: ${task.estimatedDuration} minutes
Progress: ${task.progress || 0}%
    `.trim();

        const assistantMessage = {
            id: messages.length + 1,
            type: 'assistant',
            content: `
# Task Analysis: ${task.title}

${taskDetails}

## How can I help you with this task?

I can:
- Break down the task into smaller steps
- Suggest approaches and solutions
- Provide time management strategies
- Help track progress and milestones
- Answer specific questions about implementation

What aspect would you like to focus on?`,
            followUps: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, assistantMessage]);
    };

    // Add a function to clear task selection
    const clearTaskSelection = () => {
        setSelectedTask(null);
        const assistantMessage = {
            id: messages.length + 1,
            type: 'assistant',
            content: "Task context cleared. How else can I help you?",
            followUps: [],
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

        // Scroll to bottom after user message
        scrollToBottom();
        const aiResponse = await callGeminiAPI(inputMessage);

        const assistantMessage = {
            id: messages.length + 2,
            type: 'assistant',
            content: aiResponse,
            formatted: true,
            followUps: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Scroll to bottom after AI response
        scrollToBottom();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // --- Inline follow-up handling ---
    const splitIntoLines = (content) => {
        return content.split(/\n+/).map((line, index) => ({
            id: index,
            text: line
        }));
    };

    const handleTextSelection = (messageId, lineId, lineText) => {
        const selection = window.getSelection().toString().trim();
        if (selection && selection !== lineText) {
            setSelectedText(selection);
            setActiveMessageId(messageId);
            setActiveLineId(lineId);
            setShowFollowUpInput(true);
        }
    };

    // Add this scroll helper function
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleFollowUpQuestion = async (messageId, lineId) => {
        if (!followUpPrompt.trim()) return;
        const response = await callGeminiAPI(`"${selectedText}" → ${followUpPrompt}`);

        setMessages(prev =>
            prev.map(msg =>
                msg.id === messageId
                    ? {
                        ...msg,
                        followUps: [
                            ...msg.followUps,
                            {
                                id: Date.now(),
                                lineId,
                                selectedText,
                                question: followUpPrompt,
                                answer: response,
                                expanded: true
                            }
                        ]
                    }
                    : msg
            )
        );

        setShowFollowUpInput(false);
        setSelectedText('');
        setFollowUpPrompt('');
        setActiveMessageId(null);
        setActiveLineId(null);
    };

    const toggleFollowUp = (messageId, followUpId) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === messageId
                    ? {
                        ...msg,
                        followUps: msg.followUps.map(fu =>
                            fu.id === followUpId ? { ...fu, expanded: !fu.expanded } : fu
                        )
                    }
                    : msg
            )
        );
    };

    const MessageContent = ({ message }) => {
        // Add a ref for the input
        const inputRef = React.useRef(null);

        // Split content into lines for processing
        const lines = message.content.split('\n');

        // Update handleTextSelection to focus the input
        const handleLocalTextSelection = (lineIndex, line) => {
            const selection = window.getSelection().toString().trim();
            if (selection && selection !== line) {
                handleTextSelection(message.id, lineIndex, line);
                // Focus the input after selection
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 0);
            }
        };

        return (
            <div className="max-w-none prose prose-blue prose-lg">
                {lines.map((line, lineIndex) => (
                    <div key={lineIndex} className="relative">
                        {/* Line content */}
                        <div
                            onMouseUp={() => handleLocalTextSelection(lineIndex, line)}
                            className="cursor-text"
                        >
                            <ReactMarkdown
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                }}
                            >
                                {line}
                            </ReactMarkdown>
                        </div>

                        {/* Inline follow-up input */}
                        {showFollowUpInput &&
                            activeMessageId === message.id &&
                            activeLineId === lineIndex && (
                                <div className="flex items-center gap-2 my-2 ml-4">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={followUpPrompt}
                                        onChange={(e) => setFollowUpPrompt(e.target.value)}
                                        placeholder="Ask a follow-up question..."
                                        className="flex-1 p-2 border focus:border-blue-500 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleFollowUpQuestion(message.id, lineIndex);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => handleFollowUpQuestion(message.id, lineIndex)}
                                        className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-md text-white text-sm"
                                    >
                                        Ask
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowFollowUpInput(false);
                                            setFollowUpPrompt('');
                                        }}
                                        className="hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                        {/* Rest of your follow-up answers code... */}
                    </div>
                ))}
            </div>
        );
    };
    // Loading state
    if (tasksLoading) {
        return (
            <div className="w-full">
                <div className="bg-white shadow-sm p-8 rounded-xl text-center">
                    <Loader2 className="mx-auto mb-4 w-8 h-8 text-teal-600 animate-spin" />
                    <p className="text-slate-600">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (tasksError) {
        return (
            <div className="w-full">
                <div className="bg-white shadow-sm p-8 border border-red-200 rounded-xl text-center">
                    <AlertCircle className="mx-auto mb-4 w-8 h-8 text-red-500" />
                    <h3 className="mb-2 font-semibold text-red-800">Error Loading Tasks</h3>
                    <p className="mb-4 text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex bg-gray-50 h-screen">
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="top-6 left-4 z-20 absolute bg-white hover:bg-gray-50 shadow-sm p-2 border border-gray-200 rounded-lg"
            >
                {isSidebarOpen ? (
                    // Show Close Icon when open
                    <ChevronLeft className="w-5 h-5 text-gray-600 transition-transform duration-200" />
                ) : (
                    // Show Open Icon when closed
                    <ChevronRight className="w-5 h-5 text-gray-600 transition-transform duration-200" />
                )}
            </button>
            {/* Tasks Panel with animation */}
            <div className={`flex flex-col bg-white border-gray-200 border-r overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-80' : 'w-0'
                }`}>
                <div className="p-6 border-gray-200 border-b">
                    <h2 className="pl-8 font-semibold text-gray-800 text-xl">TASKS</h2>
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
                        </div>
                    ))}
                </div>
            </div>

            {/* Assistant Panel */}
            <div className="flex flex-col flex-1">
                <div className="bg-white p-6 border-gray-200 border-b">
                    <h2 className="font-semibold text-gray-800 text-xl">ASSISTANT</h2>
                </div>

                <div className="flex-1 space-y-4 bg-gray-50 p-6 overflow-y-auto" ref={chatContainerRef}>
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
                                        {message.type === 'assistant'
                                            ? <MessageContent message={message} />
                                            : <div className="whitespace-pre-wrap">{message.content}</div>
                                        }
                                    </div>
                                    <div className={`text-xs text-gray-500 mt-1 flex items-center ${message.type === 'user' ? 'justify-end ml-12' : 'justify-start'
                                        }`}>
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
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bottom-0 sticky bg-white p-6 border-gray-200 border-t">
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={selectedTask ? `Ask about "${selectedTask.title}"...` : "Select a task and ask me anything..."}
                            disabled={isLoading}
                            className="flex-1 disabled:bg-gray-100 p-3 border focus:border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                            autoComplete="off"
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
                        <div className="bg-blue-50 p-4 border-b border-blue-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium text-blue-900">
                                        Current Task Context: {selectedTask.title}
                                    </h3>
                                    <p className="text-blue-700 text-sm">
                                        Due: {new Date(selectedTask.due_date).toLocaleDateString()} |
                                        Priority: {selectedTask.priority} |
                                        Progress: {selectedTask.progress || 0}%
                                    </p>
                                </div>
                                <button
                                    onClick={clearTaskSelection}
                                    className="px-3 py-1 border border-blue-500 hover:border-blue-700 rounded-lg text-blue-500 hover:text-blue-700 text-sm transition"
                                >
                                    Clear Context
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
