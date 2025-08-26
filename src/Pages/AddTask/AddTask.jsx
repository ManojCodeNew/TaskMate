import React, { useState } from 'react';
import { Clock, Calendar, Tag, AlertCircle, Plus, X } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useTasks } from '../../context/TaskProvider.jsx';

const AddTask = ({ onSubmit, onCancel }) => {
    // Get getToken and userId from the hook
    const { getToken, userId } = useAuth();
    const { addTask } = useTasks();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        estimatedDuration: 60,
        start_date: '',
        due_date: '',
        tags: []
    });

    const [newTag, setNewTag] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const priorityOptions = [
        { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
        { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800' }
    ];

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? e.target.checked :
                name === 'estimatedDuration' ? parseInt(value) || 0 : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Task title is required';
        }

        if (!formData.start_date) {
            newErrors.start_date = 'Start date is required';
        }

        if (!formData.due_date) {
            newErrors.due_date = 'Due date is required';
        }

        if (formData.estimatedDuration <= 0) {
            newErrors.estimatedDuration = 'Duration must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            console.log("Form Data", formData);
            // Get the Clerk JWT using the 'supabase' template you configured
            const token = await getToken({ template: 'supabase' });

            // Combine form data with the user ID from Clerk
            const dataToSubmit = {
                ...formData,
                user_id: userId // Associate the task with the authenticated user's ID
            };

            const createdTask = await addTask(dataToSubmit);
            console.log("Task created successfully:", createdTask);
            onCancel(); // Close the form after successful creation
            // // Send data to the backend API endpoint
            // const response = await fetch('http://localhost:3000/api/tasks', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify(dataToSubmit),
            // });

            // console.log("Response", response);

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(errorData.message || 'Failed to create task');
            // }

            // const createdTask = await response.json();
            // console.log("Task created successfully:", createdTask);

            // onSubmit?.(createdTask);

        } catch (error) {
            console.error('Error creating task:', error);
            // You might want to display a user-friendly error message here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // <div className="relative bg-gradient-to-br from-slate-200 via-blue-100 to-slate-300 px-4 py-8 min-h-screen overflow-hidden">


        <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                    <div className="flex justify-center items-center bg-teal-700 rounded-full w-12 h-12">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="font-bold text-slate-800 text-3xl">Create New Task</h1>
                </div>
                <p className="text-slate-600">Your daily productivity partner</p>
            </div>

            {/* Form Card */}
            <div className="bg-white/90 shadow-xl hover:shadow-2xl backdrop-blur-sm p-8 border border-white/20 rounded-2xl transition-all duration-300">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="block font-semibold text-slate-700 text-sm">
                            Task Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.title ? 'border-red-300 bg-red-50' : 'border-slate-300 focus:border-teal-500'
                                }`}
                            placeholder="Enter your task title..."
                        />
                        {errors.title && (
                            <p className="flex items-center gap-1 slide-in-from-left-2 text-red-500 text-sm animate-in">
                                <AlertCircle className="w-4 h-4" />
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="block font-semibold text-slate-700 text-sm">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="px-4 py-3 border border-slate-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-teal-500 w-full transition-all duration-200 resize-none"
                            placeholder="Describe your task in detail..."
                        />
                    </div>

                    {/* Priority and Duration Row */}
                    <div className="gap-6 grid md:grid-cols-2">
                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="block font-semibold text-slate-700 text-sm">
                                Priority Level
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className="bg-white px-4 py-3 border border-slate-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-teal-500 w-full transition-all duration-200"
                            >
                                {priorityOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${priorityOptions.find(p => p.value === formData.priority)?.color
                                }`}>
                                {priorityOptions.find(p => p.value === formData.priority)?.label}
                            </div>
                        </div>

                        {/* Estimated Duration */}
                        <div className="space-y-2">
                            <label className="block font-semibold text-slate-700 text-sm">
                                Duration (minutes) *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="estimatedDuration"
                                    value={formData.estimatedDuration}
                                    onChange={handleInputChange}
                                    min="1"
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.estimatedDuration ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                        }`}
                                />
                                <Clock className="top-3.5 right-3 absolute w-5 h-5 text-slate-400" />
                            </div>
                            {errors.estimatedDuration && (
                                <p className="flex items-center gap-1 slide-in-from-left-2 text-red-500 text-sm animate-in">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.estimatedDuration}
                                </p>
                            )}
                            <p className="text-slate-500 text-xs">
                                {Math.floor(formData.estimatedDuration / 60)}h {formData.estimatedDuration % 60}m
                            </p>
                        </div>
                    </div>

                    {/* Recurrence and Due Date Row */}
                    <div className="gap-6 grid md:grid-cols-2">
                        {/* Start Date */}
                        <div className="space-y-2">
                            <label className="block font-semibold text-slate-700 text-sm">
                                Start Date *
                            </label>
                            <div className="relative">
                                <input
                                    type="datetime-local"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.start_date ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                                />
                                <Calendar className="top-3.5 right-3 absolute w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                            {errors.start_date && (
                                <p className="flex items-center gap-1 slide-in-from-left-2 text-red-500 text-sm animate-in">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.start_date}
                                </p>
                            )}
                        </div>
                        {/* Due Date */}
                        <div className="space-y-2">
                            <label className="block font-semibold text-slate-700 text-sm">
                                Due Date *
                            </label>
                            <div className="relative">
                                <input
                                    type="datetime-local"
                                    name="due_date"
                                    value={formData.due_date}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${errors.due_date ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                        }`}
                                />
                                <Calendar className="top-3.5 right-3 absolute w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                            {errors.due_date && (
                                <p className="flex items-center gap-1 slide-in-from-left-2 text-red-500 text-sm animate-in">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.due_date}
                                </p>
                            )}
                        </div>
                    </div>



                    {/* Tags */}
                    <div className="space-y-3">
                        <label className="block font-semibold text-slate-700 text-sm">
                            <Tag className="inline mr-1 w-4 h-4" />
                            Tags
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="Add a tag..."
                                className="flex-1 px-4 py-2 border border-slate-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg text-white transition-colors duration-200"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex slide-in-from-bottom-2 items-center gap-1 bg-teal-100 px-3 py-1 rounded-full text-teal-800 text-sm animate-in"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-teal-600 transition-colors duration-200"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 hover:bg-slate-50 px-6 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex flex-1 justify-center items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="border-2 border-white/30 border-t-white rounded-full w-5 h-5 animate-spin"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Create Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        // </div>
    );
};

export default AddTask;