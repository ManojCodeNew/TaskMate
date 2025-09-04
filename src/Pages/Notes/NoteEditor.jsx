import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Bold, Italic, Underline, List, ListOrdered,
    Type, Palette, X, Link as LinkIcon
} from 'lucide-react';
import axios from 'axios';

const COLORS = [
    { bg: 'bg-white', text: 'text-gray-900' },
    { bg: 'bg-red-50', text: 'text-red-900' },
    { bg: 'bg-green-50', text: 'text-green-900' },
    { bg: 'bg-blue-50', text: 'text-blue-900' },
    { bg: 'bg-yellow-50', text: 'text-yellow-900' },
];

const FONT_SIZES = [
    { label: 'Small', value: '0.875rem' },
    { label: 'Normal', value: '1rem' },
    { label: 'Large', value: '1.25rem' },
];

const NoteEditor = ({ note, tasks, onSave, onClose }) => {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [selectedTask, setSelectedTask] = useState(note?.task_id || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const editorRef = useRef(null);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setSelectedTask(note.task_id || '');
        }
    }, [note]);

    const handleFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const noteData = {
                title: title || 'Untitled Note',
                content: editorRef.current?.innerHTML || '',
                task_id: selectedTask || null
            };

            if (note) {
                await axios.put(`/api/notes/${note.note_id}`, noteData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/notes', noteData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            onSave();
        } catch (err) {
            setError('Failed to save note');
            console.error('Error saving note:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex flex-col bg-white shadow-xl rounded-xl w-full max-w-4xl max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-gray-200 border-b">
                    <h2 className="font-semibold text-gray-900 text-xl">
                        {note ? 'Edit Note' : 'New Note'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-100 p-2 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 p-2 border-gray-200 border-b">
                    <div className="flex items-center gap-1 pr-2 border-gray-200 border-r">
                        <button
                            onClick={() => handleFormat('bold')}
                            className="hover:bg-gray-100 p-2 rounded-lg"
                            title="Bold"
                        >
                            <Bold className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleFormat('italic')}
                            className="hover:bg-gray-100 p-2 rounded-lg"
                            title="Italic"
                        >
                            <Italic className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleFormat('underline')}
                            className="hover:bg-gray-100 p-2 rounded-lg"
                            title="Underline"
                        >
                            <Underline className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 pr-2 border-gray-200 border-r">
                        <button
                            onClick={() => handleFormat('insertUnorderedList')}
                            className="hover:bg-gray-100 p-2 rounded-lg"
                            title="Bullet list"
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleFormat('insertOrderedList')}
                            className="hover:bg-gray-100 p-2 rounded-lg"
                            title="Numbered list"
                        >
                            <ListOrdered className="w-5 h-5" />
                        </button>
                    </div>

                    <select
                        onChange={(e) => handleFormat('fontSize', e.target.value)}
                        className="p-2 border border-gray-200 rounded-lg"
                    >
                        {FONT_SIZES.map((size) => (
                            <option key={size.value} value={size.value}>
                                {size.label}
                            </option>
                        ))}
                    </select>

                    {tasks?.length > 0 && (
                        <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                            <select
                                value={selectedTask}
                                onChange={(e) => setSelectedTask(e.target.value)}
                                className="p-2 border border-gray-200 rounded-lg"
                            >
                                <option value="">No linked task</option>
                                {tasks.map((task) => (
                                    <option key={task.id} value={task.id}>
                                        {task.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note Title"
                        className="mb-4 px-4 py-2 border-b focus:border-blue-500 focus:outline-none w-full font-medium text-xl"
                    />
                    <div
                        ref={editorRef}
                        contentEditable
                        className="p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-none min-h-[300px] prose"
                        dangerouslySetInnerHTML={{ __html: content }}
                        onInput={(e) => setContent(e.currentTarget.innerHTML)}
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-gray-200 border-t">
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default NoteEditor;