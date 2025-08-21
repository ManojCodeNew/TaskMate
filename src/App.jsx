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
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace /> {/* or HomePage if you make one */}
                </SignedOut>
              </>
            }
          />
          <Route
            path="/"
            element={
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            }
          />

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
            path="/loading"
            element={
              <ProtectedRoute>
                <TaskMateLoading />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drawing"
            element={
              <ProtectedRoute>
                <DrawingBoard />
              </ProtectedRoute>
            }
          />
        <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            }
          />


          {/* Catch all */}
          <Route
            path="*"
            element={
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
            }
          />
          <Route
            path="*"
            element={
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            }
          />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
