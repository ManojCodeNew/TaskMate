import React from 'react';
import NavBar from './components/Navbar';
import Dashboard from './Pages/Dashboard/Dashboard.jsx';
import Menu from './components/Menu.jsx';
import { Routes, Route } from 'react-router-dom';
import AddTask from './Pages/AddTask/AddTask.jsx';
import SignInPage from './Pages/Auth/SignInPage.jsx';
import SignUpPage from './Pages/Auth/SignUpPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { SignIn, SignInButton, SignOutButton, SignUp, SignedOut, SignedIn, UserButton } from '@clerk/clerk-react';

function App() {
  return (
    <>
      <NavBar />
      <Menu />

      {/* Routes */}
      <div className="ml-64 p-4">
          <Routes>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />

            {/* Protected Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />


            {/* <Route path="/Dashboard" element={<Dashboard />} /> */}
            <Route path='/add-task' element={<AddTask />} />
            {/* <Route path='/drawing-tool' element={<DrawingTool/>}/> */}
            {/* <Route path='/ai-assistant' element={<AIAssistant/>}/> */}
            {/* <Route path="/timer" element={<Timer />} /> */}
            {/* <Route path="/voice-notes" element={<VoiceNotes />} /> */}
            {/* <Route path="*" element={<NotFoundPage>} /> */}





          </Routes>
      </div>
      {/* <main className="mt-16 ml-64 p-4"> */}
      <Dashboard />
      {/* </main> */}
    </>
  );
}


export default App;
