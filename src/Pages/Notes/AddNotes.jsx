import React, { use, useRef, useState, useContext, useEffect } from "react";
import { NotesContext } from "../../context/NotesProvider";
import { useParams, useNavigate } from "react-router-dom";
import { useGlobalNotifications } from "../../context/NotificationProvider";
import { NOTIFICATION_TYPES } from "../../Notification/Notifications";
import { useAuth } from '@clerk/clerk-react';
function AddNotes() {
    const editorRef = useRef(null);
    const [isActive, setIsActive] = useState({
        bold: false,
        italic: false,
        underline: false,
    });

    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const { addNote, updateNote } = useContext(NotesContext);
    const { taskId, noteId } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const isEditMode = !!noteId;

    const { addNotification } = useGlobalNotifications();

    // Fetch note data if in edit mode
    useEffect(() => {
        if (isEditMode && noteId) {
            fetchNoteData();
        }
    }, [noteId, isEditMode]);

    const fetchNoteData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notes/${noteId}`, {
                headers: {
                    'Authorization': `Bearer ${await getToken({ template: 'supabase' })}`,
                },
            });
            if (response.ok) {
                const note = await response.json();
                setTitle(note.title);
                if (editorRef.current) {
                    editorRef.current.innerHTML = note.content;
                }
            }
        } catch (error) {
            console.error('Error fetching note:', error);
        } finally {
            setLoading(false);
        }
    };

    // Apply formatting using document.execCommand (old but works cross-browser)
    const formatText = (command) => {
        document.execCommand(command, false, null);
        editorRef.current.focus();
        setIsActive((prev) => ({
            ...prev,
            [command]: !prev[command],
        }));
    };

    const clearFormatting = () => {
        document.execCommand("removeFormat", false, null);
        editorRef.current.focus();
        setIsActive({
            bold: false,
            italic: false,
            underline: false,
        });
    };

    const handleSave = async () => {
        const content = editorRef.current.innerHTML;

        if (!title.trim() || !content.trim()) {
            alert("Please enter both title and content");
            return;
        }

        const noteData = {
            title,
            content,
            task_id: taskId || null,
        };

        try {
            let response;
            if (isEditMode) {
                response = await updateNote(noteId, noteData);
                addNotification({
                    type: NOTIFICATION_TYPES.SUCCESS,
                    title: 'Success!',
                    message: 'Note updated successfully',
                    duration: 4000
                });
            } else {
                response = await addNote(noteData);
                addNotification({
                    type: NOTIFICATION_TYPES.SUCCESS,
                    title: 'Success!',
                    message: 'Note created successfully',
                    duration: 4000
                });
            }

            navigate('/notes');
        } catch (err) {
            console.error("Error saving note:", err);
        }
    }

    if (loading) {
        return <div className="text-center p-8">Loading...</div>;
    }

    return (
        <div className="bg-white shadow-lg mx-auto p-6 rounded-2xl max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit Note' : 'Add New Note'}</h2>
            {/* Title */}
            <input
                type="text"
                id="Notes-Title"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-4 p-2 border-gray-200 focus:border-teal-500 border-b focus:outline-none w-full font-semibold text-xl"
            />

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-3 pb-2 border-gray-200 border-b">
                <button
                    onClick={() => formatText("bold")}
                    className={`bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md font-bold text-sm ${isActive.bold ? 'bg-gray-300' : ''}`}
                >
                    B
                </button>
                <button
                    onClick={() => formatText("italic")}
                    className={`bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm italic ${isActive.italic ? 'bg-gray-300' : ''}`}
                >
                    I
                </button>
                <button
                    onClick={() => formatText("underline")}
                    className={`bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm underline ${isActive.underline ? 'bg-gray-300' : ''}`}
                >
                    U
                </button>

                <button
                    onClick={clearFormatting}
                    className="bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-red-600 text-sm"
                >
                    Clear
                </button>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                className="p-3 border border-gray-300 rounded-md focus:outline-none min-h-[150px]"
                placeholder="Write your note here..."
                suppressContentEditableWarning={true}
            ></div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 mt-4">
                <button
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-gray-600 transition"
                    onClick={() => navigate('/notes')}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg text-white transition">
                    {isEditMode ? 'Update Note' : 'Save Note'}
                </button>
            </div>
        </div>
    );
}

export default AddNotes;
