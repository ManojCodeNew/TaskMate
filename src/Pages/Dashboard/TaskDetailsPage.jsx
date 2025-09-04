import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTasks } from "../../context/TaskProvider";
import {
    Clock,
    Calendar,
    CheckCircle,
    Circle,
    Loader2,
    AlertCircle,
    Tag,
    Star,
    ArrowLeft,
    Edit2,
    Save,
    Trash2,
    Minus,
    Plus,
} from "lucide-react";

// --- Constants ---
const POMODORO_TIME = 25 * 60; // 25 minutes
const SHORT_BREAK = 5 * 60; // 5 minutes
const LONG_BREAK = 15 * 60; // 15 minutes
const POMODOROS_BEFORE_LONG_BREAK = 4;

export default function TaskDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { tasks, loading, error, updateTask, deleteTask, fetchTasks } = useTasks();

    // --- Task state ---
    const [task, setTask] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState(null);
    const [processingTask, setProcessingTask] = useState(false);

    // --- Timer mode state ---
    // null | "manual" | "focus"
    const [activeTimer, setActiveTimer] = useState(null);

    // --- Manual timer state ---
    const [manualActive, setManualActive] = useState(false);
    const [manualSeconds, setManualSeconds] = useState(0);

    // --- Focus (Pomodoro) state ---
    const [focusPhase, setFocusPhase] = useState("idle"); // "idle" | "work" | "break"
    const [focusSeconds, setFocusSeconds] = useState(POMODORO_TIME);
    const [pomodoroGoal, setPomodoroGoal] = useState(1); // how many the user wants this run
    const [pomodorosDoneInRun, setPomodorosDoneInRun] = useState(0);

    // completed across the task lifetime (persisted)
    const [completedPomodoros, setCompletedPomodoros] = useState(0);

    // break cadence
    const longBreakDue = useMemo(
        () => (completedPomodoros + pomodorosDoneInRun) % POMODOROS_BEFORE_LONG_BREAK === 0,
        [completedPomodoros, pomodorosDoneInRun]
    );

    // --- Refs for intervals (avoid multiple intervals) ---
    const manualIntervalRef = useRef(null);
    const focusIntervalRef = useRef(null);

    // --- Derived display helpers ---
    const safeEstimatedSecs = Math.max(1, (task?.estimatedDuration || 60) * 60);
    const totalTimeSpent = (task?.time_spent || 0) + (manualActive ? manualSeconds : 0); // include running manual session in bar

    const fmtClock = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, "0");
        const ss = Math.floor(s % 60).toString().padStart(2, "0");
        return `${m}:${ss}`;
    };

    const fmtDuration = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        const parts = [];
        if (h) parts.push(`${h}h`);
        if (m) parts.push(`${m}m`);
        if (!h && !m) parts.push(`${sec}s`);
        return parts.join(" ") || "0s";
    };

    // --- Effects: load tasks ---
    useEffect(() => {
        if (tasks.length === 0 && !loading && !error) fetchTasks();
    }, []); // eslint-disable-line

    useEffect(() => {
        if (tasks.length > 0) {
            const found = tasks.find((t) => String(t.id) === String(id));
            if (found) {
                setTask(found);
                setEditedTask(found);
                setCompletedPomodoros(found.pomodoros_completed || 0);
            } else {
                setTask(null);
            }
        }
    }, [id, tasks]);

    // --- Cleanup on unmount ---
    useEffect(() => {
        return () => {
            if (manualIntervalRef.current) clearInterval(manualIntervalRef.current);
            if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);
        };
    }, []);

    // --- UI helpers ---
    const getPriorityColor = (priority) => {
        switch ((priority || "").toUpperCase()) {
            case "HIGH":
                return "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200";
            case "MEDIUM":
                return "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200";
            case "LOW":
                return "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200";
            default:
                return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusColor = (status) => {
        switch ((status || "").toUpperCase()) {
            case "COMPLETED":
                return "bg-green-50 text-green-700 border-green-200";
            case "PENDING":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "IN_PROGRESS":
                return "bg-blue-50 text-blue-700 border-blue-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    // --- Manual timer controls ---
    const startManual = () => {
        if (manualActive) return;
        if (activeTimer && activeTimer !== "manual") return; // cannot switch while focus is running
        setActiveTimer("manual");
        setManualActive(true);
        manualIntervalRef.current = setInterval(() => {
            setManualSeconds((s) => s + 1);
        }, 1000);
    };

    const pauseManual = async () => {
        if (!manualActive) return;
        setManualActive(false);
        if (manualIntervalRef.current) clearInterval(manualIntervalRef.current);

        // Persist session to DB as incremental time
        await persistTime(manualSeconds);
    };

    const stopManual = async () => {
        if (manualIntervalRef.current) clearInterval(manualIntervalRef.current);
        const secs = manualSeconds;
        setManualActive(false);
        setManualSeconds(0);
        // Persist the session if any time elapsed
        if (secs > 0) await persistTime(secs);
        setActiveTimer(null);
    };

    // --- Focus (Pomodoro) controls ---
    const startFocusRun = () => {
        if (activeTimer && activeTimer !== "focus") return; // cannot switch while manual is running
        if (focusPhase !== "idle") return; // already in a run

        setActiveTimer("focus");
        setPomodorosDoneInRun(0);
        setFocusPhase("work");
        setFocusSeconds(POMODORO_TIME);

        focusIntervalRef.current = setInterval(() => {
            setFocusSeconds((s) => s - 1);
        }, 1000);
    };

    // Enforce non-interruptible focus: no pause/stop exposed. Only transitions when timer hits 0.
    useEffect(() => {
        if (focusPhase === "idle") return;
        if (focusSeconds > 0) return;

        // Phase finished
        if (focusPhase === "work") {
            // Work session complete
            const handleWorkComplete = async () => {
                await persistTime(POMODORO_TIME);
                setPomodorosDoneInRun((c) => c + 1);
                setCompletedPomodoros((c) => c + 1);

                // Decide next phase
                const shouldContinue = pomodorosDoneInRun + 1 < pomodoroGoal; // more to do in this run
                if (shouldContinue) {
                    setFocusPhase("break");
                    setFocusSeconds(longBreakDue ? LONG_BREAK : SHORT_BREAK);
                } else {
                    // Run finished
                    clearInterval(focusIntervalRef.current);
                    setFocusPhase("idle");
                    setActiveTimer(null);
                }
            };
            handleWorkComplete();
        } else if (focusPhase === "break") {
            // Break finished -> start next work
            setFocusPhase("work");
            setFocusSeconds(POMODORO_TIME);
        }
    }, [focusSeconds, focusPhase, longBreakDue, pomodoroGoal, pomodorosDoneInRun]);

    // Keep a single interval alive for focus; reset when phase changes
    useEffect(() => {
        if (focusPhase === "idle") {
            if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);
            return;
        }
        if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);
        focusIntervalRef.current = setInterval(() => {
            setFocusSeconds((s) => Math.max(0, s - 1));
        }, 1000);
        return () => {
            if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);
        };
    }, [focusPhase]);

    // Persist incremental seconds to DB and refresh local task state
    const persistTime = async (secondsToAdd) => {
        try {
            if (!task) return;
            const newTotal = (task.time_spent || 0) + secondsToAdd;
            const payload = {
                time_spent: newTotal,
                last_session_time: secondsToAdd,
                last_paused: new Date().toISOString(),
                pomodoros_completed: completedPomodoros + (activeTimer === "focus" && focusPhase === "work" ? 1 : 0),
            };
            await updateTask(task.id, payload);
            // Optimistically update local task
            setTask((prev) => ({ ...prev, time_spent: newTotal, pomodoros_completed: payload.pomodoros_completed }));
        } catch (e) {
            console.error("Error persisting time:", e);
        }
    };

    // --- Save, Delete, Toggle Complete ---
    const handleSave = async () => {
        if (!editedTask) return;
        setProcessingTask(true);
        try {
            const updateData = {
                title: editedTask.title,
                description: editedTask.description,
                priority: editedTask.priority,
                status: editedTask.status,
                tags: editedTask.tags || [],
                estimatedDuration: editedTask.estimatedDuration || 60,
                due_date: editedTask.due_date,
                start_date: editedTask.start_date,
            };
            await updateTask(editedTask.id, updateData);
            setIsEditing(false);
        } catch (e) {
            console.error("Error updating task:", e);
        } finally {
            setProcessingTask(false);
        }
    };

    const handleDelete = async () => {
        if (!task) return;
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        setProcessingTask(true);
        try {
            await deleteTask(task.id);
            navigate("/dashboard");
        } catch (e) {
            console.error("Error deleting task:", e);
        } finally {
            setProcessingTask(false);
        }
    };

    const toggleTaskCompletion = async () => {
        if (!task || processingTask) return;
        setProcessingTask(true);
        try {
            const newStatus = (task.status || "pending").toLowerCase() === "completed" ? "pending" : "completed";
            const completed_at = newStatus === "completed" ? new Date().toISOString() : null;
            await updateTask(task.id, { status: newStatus, completed_at });
        } catch (e) {
            console.error("Error updating task:", e);
        } finally {
            setProcessingTask(false);
        }
    };

    // --- Formatting helpers ---
    const fmtDateTime = (dateString) => {
        if (!dateString) return "Not set";
        const d = new Date(dateString);
        return d.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // --- Render states ---
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
                        onClick={() => navigate("/dashboard")}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

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
                        onClick={() => navigate("/dashboard")}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const progressPct = Math.min(Math.round((totalTimeSpent / safeEstimatedSecs) * 100), 100);

    return (
        <div className="space-y-6 mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex justify-center items-center bg-white hover:bg-gray-50 shadow-sm border border-gray-200 rounded-full w-10 h-10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="font-bold text-gray-900 text-2xl">Task Details</h1>
            </div>

            <div className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden">
                {/* Task header */}
                <div className="p-6 border-gray-100 border-b">
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            {/* Completion toggle */}
                            <button
                                onClick={toggleTaskCompletion}
                                disabled={processingTask}
                                className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                            >
                                {processingTask ? (
                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                ) : (task.status || "").toLowerCase() === "completed" ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500" />
                                )}
                            </button>

                            {/* Title */}
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedTask.title || ""}
                                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-xl"
                                />
                            ) : (
                                <h2
                                    className={`text-xl font-semibold ${(task.status || "").toLowerCase() === "completed"
                                            ? "line-through text-gray-500"
                                            : "text-gray-900"
                                        }`}
                                >
                                    {task.title}
                                </h2>
                            )}
                        </div>

                        {/* Actions */}
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

                    {/* Priority */}
                    <div className="mt-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {(task.priority || "medium").toUpperCase()} Priority
                        </span>
                    </div>
                </div>

                {/* Timer selector */}
                <div className="flex gap-4 p-6 border-gray-100 border-t">
                    <button
                        onClick={() => {
                            if (activeTimer && activeTimer !== "focus" && manualActive) return; // cannot switch while manual running
                            setActiveTimer(activeTimer === "focus" ? null : "focus");
                        }}
                        disabled={manualActive || focusPhase !== "idle"}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTimer === "focus" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } ${manualActive || focusPhase !== "idle" ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        Focus Mode
                    </button>

                    <button
                        onClick={() => {
                            if (activeTimer && activeTimer !== "manual" && focusPhase !== "idle") return; // cannot switch while focus running
                            setActiveTimer(activeTimer === "manual" ? null : "manual");
                        }}
                        disabled={focusPhase !== "idle"}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTimer === "manual" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } ${focusPhase !== "idle" ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        Manual Timer
                    </button>
                </div>

                {/* Focus Mode */}
                {activeTimer === "focus" && (
                    <div className="mt-6 p-6 border-gray-100 border-t">
                        <h3 className="mb-4 font-semibold text-gray-900 text-lg">Focus Mode (Pomodoro)</h3>

                        {focusPhase === "idle" && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setPomodoroGoal((n) => Math.max(1, n - 1))} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg">
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="font-medium text-xl">{pomodoroGoal} Pomodoro{pomodoroGoal > 1 ? "s" : ""}</span>
                                    <button onClick={() => setPomodoroGoal((n) => n + 1)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <button onClick={startFocusRun} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg w-full font-medium text-white">
                                    Start Focus Run
                                </button>
                            </div>
                        )}

                        {focusPhase !== "idle" && (
                            <div className="flex flex-col items-center gap-2">
                                <p className={`font-bold ${focusPhase === "work" ? "text-blue-600" : "text-green-600"} text-3xl`}>
                                    {fmtClock(focusSeconds)}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {focusPhase === "work" ? "Focus session running – non-interruptible" : longBreakDue ? "Long break" : "Short break"}
                                </p>
                                <p className="text-gray-500 text-xs">
                                    Progress this run: {pomodorosDoneInRun}/{pomodoroGoal} • Total done: {completedPomodoros}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Manual Timer */}
                {activeTimer === "manual" && (
                    <div className="mt-6 p-6 border-gray-100 border-t">
                        <h3 className="mb-4 font-semibold text-gray-900 text-lg">Manual Timer</h3>
                        <div className="flex items-center gap-4">
                            <p className="font-bold text-green-600 text-2xl">{fmtClock(manualSeconds)}</p>
                            {!manualActive ? (
                                <button onClick={startManual} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white">
                                    Start
                                </button>
                            ) : (
                                <>
                                    <button onClick={pauseManual} className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg text-white">
                                        Pause & Save
                                    </button>
                                    <button onClick={stopManual} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white">
                                        Stop & Reset
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="p-6">
                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="mb-2 font-medium text-gray-500 text-sm">Description</h3>
                        {isEditing ? (
                            <textarea
                                value={editedTask.description || ""}
                                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full h-32"
                                placeholder="Add a description..."
                            />
                        ) : (
                            <p className="text-gray-700">{task.description || "No description provided"}</p>
                        )}
                    </div>

                    {/* Time details */}
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-6">
                        <div>
                            <h3 className="mb-2 font-medium text-gray-500 text-sm">Start Date & Time</h3>
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                {isEditing ? (
                                    <input
                                        type="datetime-local"
                                        value={editedTask.start_date ? new Date(editedTask.start_date).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => setEditedTask({ ...editedTask, start_date: e.target.value })}
                                        className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <span className="font-medium text-gray-700">{fmtDateTime(task.start_date)}</span>
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
                                            min="1"
                                            value={editedTask.estimatedDuration || 60}
                                            onChange={(e) =>
                                                setEditedTask({ ...editedTask, estimatedDuration: parseInt(e.target.value) || 60 })
                                            }
                                            className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                                        />
                                        <span>minutes</span>
                                    </div>
                                ) : (
                                    <span className="font-medium text-gray-700">{task.estimatedDuration || 60} minutes</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status and Due */}
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-6">
                        <div>
                            <h3 className="mb-2 font-medium text-gray-500 text-sm">Status</h3>
                            {isEditing ? (
                                <select
                                    value={editedTask.status || "pending"}
                                    onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            ) : (
                                <span
                                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(
                                        task.status
                                    )}`}
                                >
                                    {(task.status || "pending").charAt(0).toUpperCase() + (task.status || "pending").slice(1)}
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
                                        value={editedTask.due_date ? new Date(editedTask.due_date).toISOString().slice(0, 16) : ""}
                                        onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                                        className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <span className="font-medium text-gray-700">{fmtDateTime(task.due_date)}</span>
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
                                    value={(editedTask.tags || []).join(", ")}
                                    onChange={(e) =>
                                        setEditedTask({
                                            ...editedTask,
                                            tags: e.target.value
                                                .split(",")
                                                .map((t) => t.trim())
                                                .filter(Boolean),
                                        })
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                />
                                <p className="mt-1 text-gray-500 text-xs">Separate tags with commas</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {task.tags && task.tags.length > 0 ? (
                                    task.tags.map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full font-medium text-gray-700 text-xs">
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

                    {/* Time Tracking */}
                    <div className="mb-6">
                        <h3 className="mb-2 font-medium text-gray-500 text-sm">Time Tracking</h3>
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Time Spent:</span>
                                <span className="font-medium text-gray-800">{fmtDuration(totalTimeSpent)}</span>
                            </div>

                            {manualActive && (
                                <div className="flex justify-between items-center text-blue-600">
                                    <span>Current Manual Session:</span>
                                    <span className="font-medium">{fmtDuration(manualSeconds)}</span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <div className="flex justify-between text-gray-500 text-xs">
                                    <span>Progress</span>
                                    <span>{progressPct}%</span>
                                </div>
                                <div className="bg-gray-200 rounded-full w-full h-2">
                                    <div className="bg-blue-600 rounded-full h-2 transition-all duration-300" style={{ width: `${progressPct}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="pt-4 border-gray-100 border-t">
                        <h3 className="mb-2 font-medium text-gray-500 text-sm">Timestamps</h3>
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 text-gray-600 text-sm">
                            <div>
                                <span className="font-medium">Created:</span> {fmtDateTime(task.created_at)}
                            </div>
                            <div>
                                <span className="font-medium">Updated:</span> {fmtDateTime(task.updated_at)}
                            </div>
                            {task.completed_at && (
                                <div className="md:col-span-2">
                                    <span className="font-medium">Completed:</span> {fmtDateTime(task.completed_at)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
