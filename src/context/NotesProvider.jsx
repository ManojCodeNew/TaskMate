import React, { useState, useCallback, createContext } from "react";
import { useAuth } from '@clerk/clerk-react';
// Step 1: Create Context
export const NotesContext = createContext();

// Step 2: Create Provider
export function NotesProvider({ children }) {
    const [notes, setNotes] = useState();
    const [error, setError] = useState(null);
    const { getToken } = useAuth();

    //Get auth token
    const getUserToken = async () => {
        const token = await getToken({ template: 'supabase' });
        return token;
    };

    const fetchNotes = useCallback(async (taskId = null) => {
        try {
            const token = await getUserToken();
            let url = `${import.meta.env.VITE_API_BASE_URL}/notes`;

            if (taskId) {
                url += `?task_id=${taskId}`;
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch notes");

            const data = await response.json();
            setNotes(data);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching notes:", err);
        }
    }, []);


    // Use useCallback to memoize functions
    const addNote = useCallback(async (noteData) => {
        try {
            console.log("Adding note with data:", noteData);

            const token = await getUserToken();
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...noteData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }),
            });

            if (!response.ok) throw new Error('Failed to add note');
            const newNote = await response.json();
            setNotes((prev) => [...prev, newNote]);
            return newNote;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const updateNote = useCallback(async (noteId, updateData) => {
        try {
            const token = await getUserToken();
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/notes/${noteId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...updateData,
                        updated_at: new Date().toISOString(),
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to update note");

            const updatedNote = await response.json();
            setNotes((prev) =>
                prev.map((note) => (note.note_id === noteId ? updatedNote : note))
            );
            return updatedNote;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteNote = useCallback(async (noteId) => {
        try {
            const token = await getUserToken();
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/notes/${noteId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to delete note");

            setNotes((prev) => prev.filter((note) => note.note_id !== noteId));
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    return (
        <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, fetchNotes, error }}>
            {children}
        </NotesContext.Provider>
    )

}