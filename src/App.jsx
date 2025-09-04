import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedOut, SignedIn } from '@clerk/clerk-react';

import Layout from './components/Layout.jsx';
import Dashboard from './Pages/Dashboard/Dashboard.jsx';
import AddTask from './Pages/AddTask/AddTask.jsx';
import SignInPage from './Pages/Auth/SignInPage.jsx';
import SignUpPage from './Pages/Auth/SignUpPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import TaskMateLoading from './Pages/Loading/TaskMateLoading.jsx';
import DrawingBoard from './Pages/DrawingTool/DrawingBoard.jsx';
import AIAssistant from './Pages/AIChat/AIAssistant.jsx';
import TaskDetailsPage from './Pages/Dashboard/TaskDetailsPage.jsx';
import Home from './Pages/Home/Home.jsx';
import TaskAnalytics from './Pages/TaskAnalytics/TaskAnalytics.jsx';
// import NotesPage from './Pages/Notes/NotesPage.jsx';
import Notes from './Pages/Notes/Notes.jsx';
function App() {
  return (
    <div className="relative bg-gradient-to-br from-slate-200 via-blue-100 to-slate-300 min-h-screen overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="top-10 right-10 absolute bg-slate-400 opacity-20 rounded-full w-32 h-32 animate-pulse"></div>
        <div className="bottom-20 left-10 absolute bg-teal-600 opacity-20 rounded-full w-24 h-24 animate-bounce"></div>
      </div>

      {/* Wrap all pages in Layout */}
      <Layout>
        <Routes>
          {/* Default redirect based on auth */}
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/*  */}
          <Route
            path="/add-task"
            element={
              <ProtectedRoute>
                <AddTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drawing-tool"
            element={
              <ProtectedRoute>
                <DrawingBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loading"
            element={
              <ProtectedRoute>
                <TaskMateLoading />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <ProtectedRoute>
                <TaskDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <TaskAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
