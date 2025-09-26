import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaTasks, FaStar } from "react-icons/fa";
import { AlertCircle, Loader2, Menu, X, Send, Bot, MessageSquare } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useTasks } from '../../context/TaskProvider.jsx';
import rehypeHighlight from "rehype-highlight";
import ReactMarkdown from "react-markdown";
import "highlight.js/styles/github-dark.css"

const AIAssistant = () => {
    const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            content: '👋 Hello! I\'m your AI assistant. How can I help you today?',
            followUps: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFollowUpInput, setShowFollowUpInput] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [followUpPrompt, setFollowUpPrompt] = useState('');
    const [activeMessageId, setActiveMessageId] = useState(null);
    const [activeLineId, setActiveLineId] = useState(null);
    const { userId, getToken } = useAuth();

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Auto-save chat history whenever messages change
    useEffect(() => {
        if (messages.length > 1) {
            saveChatHistory(messages);
        }
    }, [messages]);

    // Load chat history on component mount
    useEffect(() => {
        loadChatHistory();
    }, [userId]);

    const loadChatHistory = async () => {
        try {
            const token = await getToken();
            const response = await fetch('http://localhost:3000/api/ai-history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const history = await response.json();
                if (history.length > 0) {
                    setMessages(history);
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const saveChatHistory = async (newMessages) => {
        try {
            const token = await getToken();
            await fetch('http://localhost:3000/api/ai-history/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ history: newMessages })
            });
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    };

    const formatGeminiResponse = (rawResponse) => {
        if (!rawResponse) return "I couldn't generate a response. Please try again.";
        let formatted = rawResponse.trim();
        formatted = formatted.replace(/\n{3,}/g, '\n\n');
        formatted = formatted.replace(/\s{3,}/g, ' ');
        return formatted;
    };

    const callGeminiAPI = async (message) => {
        try {
            setIsLoading(true);
            setError(null);

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

            if (!Answer) {
                throw new Error('Invalid API response structure');
            }

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
            content: `# 📋 Task Analysis: ${task.title}\n\n${taskDetails}\n\n## How can I help you with this task?\n\nI can:\n- Break down the task into smaller steps\n- Suggest approaches and solutions\n- Provide time management strategies\n- Help track progress and milestones\n- Answer specific questions about implementation\n\nWhat aspect would you like to focus on?`,
            followUps: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, assistantMessage]);
    };

    const clearTaskSelection = () => {
        setSelectedTask(null);
        const assistantMessage = {
            id: messages.length + 1,
            type: 'assistant',
            content: "✅ Task context cleared. How else can I help you?",
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
        scrollToBottom();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const MessageContent = ({ message }) => (
        <div className="prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {message.content}
            </ReactMarkdown>
        </div>
    );

    if (tasksLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
                    <p className="text-slate-600">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    if (tasksError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                    <h3 className="mb-2 text-lg font-semibold text-red-800">Error Loading Tasks</h3>
                    <p className="text-red-600">{tasksError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-slate-200 shadow-lg overflow-hidden`}>
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-[#5DA6A0] to-[#2F6F6A]">
                    <div className="flex items-center space-x-3">
                        <FaTasks className="w-6 h-6 text-white" />
                        <h2 className="text-xl font-bold text-white">Tasks</h2>
                    </div>
                </div>
                
                <div className="p-4 space-y-3 overflow-y-auto h-full">
                    {tasks.filter(task => 
                        task.status !== "completed" && 
                        task.status !== "Completed" && 
                        task.user_id === userId &&
                        new Date(task.due_date) >= new Date()
                    ).map((task) => (
                        <div
                            key={task.id}
                            onClick={() => handleTaskSelect(task)}
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                                selectedTask?.id === task.id
                                    ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-[#5DA6A0] shadow-md'
                                    : 'bg-white border border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <h3 className="font-semibold text-slate-800 mb-2">{task.title}</h3>
                            <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                            <div className="flex items-center justify-between mt-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {task.priority}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(task.due_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-white border-b border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-[#5DA6A0] to-[#2F6F6A] rounded-lg">
                                <FaStar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">AI Assistant</h1>
                                <p className="text-sm text-slate-600">Your intelligent task companion</p>
                            </div>
                        </div>
                    </div>
                    
                    {selectedTask && (
                        <div className="flex items-center space-x-3">
                            <div className="px-4 py-2 bg-teal-50 rounded-lg border border-[#5DA6A0]">
                                <span className="text-sm font-medium text-[#2F6F6A]">
                                    📋 {selectedTask.title}
                                </span>
                            </div>
                            <button
                                onClick={clearTaskSelection}
                                className="px-3 py-1 text-sm text-[#5DA6A0] hover:text-[#2F6F6A] transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto" ref={chatContainerRef}>
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                        message.type === 'assistant' 
                                            ? 'bg-gradient-to-r from-[#5DA6A0] to-[#2F6F6A]' 
                                            : 'bg-gradient-to-r from-slate-500 to-slate-600'
                                    }`}>
                                        {message.type === 'assistant' ? 
                                            <Bot className="w-5 h-5 text-white" /> : 
                                            <FaUser className="w-4 h-4 text-white" />
                                        }
                                    </div>
                                    
                                    <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-6 py-4 rounded-2xl shadow-sm ${
                                            message.type === 'user'
                                                ? 'bg-gradient-to-r from-[#5DA6A0] to-[#2F6F6A] text-white'
                                                : 'bg-white border border-slate-200'
                                        }`}>
                                            {message.type === 'assistant' ? (
                                                <MessageContent message={message} />
                                            ) : (
                                                <div className="whitespace-pre-wrap">{message.content}</div>
                                            )}
                                        </div>
                                        <span className="mt-2 text-xs text-slate-500">
                                            {message.timestamp}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#5DA6A0] to-[#2F6F6A] flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                        <div className="flex items-center space-x-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-[#5DA6A0]" />
                                            <span className="text-slate-600">AI is thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-slate-200">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-end space-x-4">
                            <div className="flex-1 relative">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={selectedTask ? `Ask about "${selectedTask.title}"...` : "Type your message..."}
                                    disabled={isLoading}
                                    rows={1}
                                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5DA6A0] focus:border-transparent resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                                    style={{ minHeight: '48px', maxHeight: '120px' }}
                                />
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !inputMessage.trim()}
                                className="p-3 bg-gradient-to-r from-[#5DA6A0] to-[#2F6F6A] text-white rounded-xl hover:from-[#468C87] hover:to-[#2F6F6A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;