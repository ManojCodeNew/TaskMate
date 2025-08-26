import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TaskProvider';
import { Clock, Calendar, CheckCircle, Circle, Loader2, AlertCircle, Tag, Star, ArrowLeft, Edit2, Save, Trash2 } from 'lucide-react';

const TaskDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tasks, loading, error, updateTask, deleteTask, fetchTasks } = useTasks();
    const [task, setTask] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState(null);
    const [processingTask, setProcessingTask] = useState(false);

    // Fetch tasks when component mounts if they're not already loaded
    useEffect(() => {
        if (tasks.length === 0 && !loading && !error) {
            fetchTasks();
        }
    }, []);

    useEffect(() => {
        if (tasks.length > 0) {
            // Convert id to string for comparison since URL params are always strings
            const foundTask = tasks.find(t => String(t.id) === String(id));
            if (foundTask) {
                setTask(foundTask);
                setEditedTask(foundTask);
            } else {
                setTask(null);
            }
        }
    }, [id, tasks]);

    const getPriorityColor = (priority) => {
        switch ((priority || '').toUpperCase()) {
            case 'HIGH': return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200';
            case 'MEDIUM': return 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200';
            case 'LOW': return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200';
            default: return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch ((status || '').toUpperCase()) {
            case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const handleSave = async () => {
        if (!editedTask) return;
        
        setProcessingTask(true);
        try {
            // Only update fields that exist in the schema
            const updateData = {
                title: editedTask.title,
                description: editedTask.description,
                priority: editedTask.priority,
                status: editedTask.status,
                tags: editedTask.tags || [],
                estimatedDuration: editedTask.estimatedDuration || 60,
                due_date: editedTask.due_date,
                start_date: editedTask.start_date
            };
            
            await updateTask(editedTask.id, updateData);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating task:', err);
        } finally {
            setProcessingTask(false);
        }
    };

    const handleDelete = async () => {
        if (!task) return;
        
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        setProcessingTask(true);
        try {
            await deleteTask(task.id);
            navigate('/dashboard');
        } catch (err) {
            console.error('Error deleting task:', err);
        } finally {
            setProcessingTask(false);
        }
    };

    const toggleTaskCompletion = async () => {
        if (!task || processingTask) return;
        
        setProcessingTask(true);
        try {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            const completed_at = newStatus === 'completed' ? new Date().toISOString() : null;
            
            await updateTask(task.id, {
                status: newStatus,
                completed_at: completed_at
            });
        } catch (err) {
            console.error('Error updating task:', err);
        } finally {
            setProcessingTask(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Not set';
        
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'Not set';
        
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="mx-auto p-6 max-w-4xl">
                <div className="bg-white shadow-sm p-12 border border-gray-100 rounded-2xl text-center">
                    <div className="inline-flex justify-center items-center bg-blue-50 mb-4 rounded-full w-16 h-16 animate-pulse">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-lg">Loading task details</h3>
                    <p className="text-gray-500">Please wait while we fetch the task information</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="mx-auto p-6 max-w-4xl">
                <div className="bg-white shadow-sm p-12 border border-red-200 rounded-2xl text-center">
                    <div className="inline-flex justify-center items-center bg-red-50 mb-4 rounded-full w-16 h-16 animate-pulse">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-lg">Unable to load task</h3>
                    <p className="mb-6 text-gray-600">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Task not found
    if (!task) {
        return (
            <div className="mx-auto p-6 max-w-4xl">
                <div className="bg-white shadow-sm p-12 border border-amber-200 rounded-2xl text-center">
                    <div className="inline-flex justify-center items-center bg-amber-50 mb-4 rounded-full w-16 h-16">
                        <AlertCircle className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-lg">Task not found</h3>
                    <p className="mb-6 text-gray-600">The task you're looking for doesn't exist or has been deleted.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 mx-auto p-6 max-w-4xl">
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex justify-center items-center bg-white hover:bg-gray-50 shadow-sm border border-gray-200 rounded-full w-10 h-10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="font-bold text-gray-900 text-2xl">Task Details</h1>
            </div>

            {/* Task Details Card */}
            <div className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden">
                {/* Task Header */}
                <div className="p-6 border-gray-100 border-b">
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            {/* Completion Toggle */}
                            <button
                                onClick={toggleTaskCompletion}
                                disabled={processingTask}
                                className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                            >
                                {processingTask ? (
                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                ) : task.status === 'completed' ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500" />
                                )}
                            </button>

                            {/* Title */}
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedTask.title || ''}
                                    onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-xl"
                                />
                            ) : (
                                <h2 className={`text-xl font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {task.title}
                                </h2>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={processingTask}
                                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                                    >
                                        {processingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditedTask(task);
                                        }}
                                        className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium text-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium text-gray-700 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={processingTask}
                                        className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-medium text-red-600 transition-colors"
                                    >
                                        {processingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Priority Badge */}
                    <div className="mt-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' && <Star className="inline mr-1 w-3 h-3" />}
                            {(task.priority || 'medium').toUpperCase()} Priority
                        </span>
                    </div>
                </div>

                {/* Task Body */}
                <div className="p-6">
                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="mb-2 font-medium text-gray-500 text-sm">Description</h3>
                        {isEditing ? (
                            <textarea
                                value={editedTask.description || ''}
                                onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-32"
                                placeholder="Add a description..."
                            />
                        ) : (
                            <p className="text-gray-700">
                                {task.description || "No description provided"}
                            </p>
                        )}
                    </div>

                    {/* Time Details */}
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-6">
                        <div>
                            <h3 className="mb-2 font-medium text-gray-500 text-sm">Start Date & Time</h3>
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                {isEditing ? (
                                    <input
                                        type="datetime-local"
                                        value={editedTask.start_date ? new Date(editedTask.start_date).toISOString().slice(0, 16) : ''}
                                        onChange={(e) => setEditedTask({...editedTask, start_date: e.target.value})}
                                        className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <span className="font-medium text-gray-700">
                                        {formatDateTime(task.start_date)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 font-medium text-gray-500 text-sm">Estimated Duration</h3>
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg">
                                <Clock className="w-5 h-5 text-gray-500" />
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={editedTask.estimatedDuration || 60}
                                            onChange={(e) => setEditedTask({...editedTask, estimatedDuration: parseInt(e.target.value) || 60})}
                                            className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                                            min="1"
                                        />
                                        <span>minutes</span>
                                    </div>
                                ) : (
                                    <span className="font-medium text-gray-700">
                                        {task.estimatedDuration || 60} minutes
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status and Due Date */}
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-6">
                        <div>
                            <h3 className="mb-2 font-medium text-gray-500 text-sm">Status</h3>
                            {isEditing ? (
                                <select
                                    value={editedTask.status || 'pending'}
                                    onChange={(e) => setEditedTask({...editedTask, status: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            ) : (
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(task.status)}`}>
                                    {task.status === 'completed' && <CheckCircle className="inline mr-2 w-4 h-4" />}
                                    {(task.status || 'pending').charAt(0).toUpperCase() + (task.status || 'pending').slice(1)}
                                </span>
                            )}
                        </div>

                        <div>
                            <h3 className="mb-2 font-medium text-gray-500 text-sm">Due Date</h3>
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                {isEditing ? (
                                    <input
                                        type="datetime-local"
                                        value={editedTask.due_date ? new Date(editedTask.due_date).toISOString().slice(0, 16) : ''}
                                        onChange={(e) => setEditedTask({...editedTask, due_date: e.target.value})}
                                        className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <span className="font-medium text-gray-700">
                                        {formatDateTime(task.due_date)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-6">
                        <h3 className="mb-2 font-medium text-gray-500 text-sm">Tags</h3>
                        {isEditing ? (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Add tags separated by commas"
                                    value={(editedTask.tags || []).join(', ')}
                                    onChange={(e) => setEditedTask({...editedTask, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                />
                                <p className="mt-1 text-gray-500 text-xs">Separate tags with commas</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {task.tags && task.tags.length > 0 ? (
                                    task.tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full font-medium text-gray-700 text-xs">
                                            <Tag className="mr-1 w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500">No tags</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="pt-4 border-gray-100 border-t">
                        <h3 className="mb-2 font-medium text-gray-500 text-sm">Timestamps</h3>
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 text-gray-600 text-sm">
                            <div>
                                <span className="font-medium">Created:</span> {formatDateTime(task.created_at)}
                            </div>
                            <div>
                                <span className="font-medium">Updated:</span> {formatDateTime(task.updated_at)}
                            </div>
                            {task.completed_at && (
                                <div className="md:col-span-2">
                                    <span className="font-medium">Completed:</span> {formatDateTime(task.completed_at)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsPage;