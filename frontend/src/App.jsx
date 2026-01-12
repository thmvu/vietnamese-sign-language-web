import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home/Home'
import CourseList from './pages/Course/CourseList'
import LessonDetail from './pages/Lesson/LessonDetail'
import Quiz from './pages/Quiz/Quiz'
import Practice from './pages/Practice/Practice'
import ChatBot from './pages/ChatBot/ChatBot'
import Account from './pages/Account/Account'
import AdminDashboard from './pages/Admin/AdminDashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsLoggedIn(true)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        {isLoggedIn && <Header user={user} onLogout={handleLogout} />}
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              isLoggedIn ? <Navigate to="/courses" /> : <Home onLogin={handleLogin} />
            } />

            {/* Protected Routes */}
            <Route path="/courses" element={
              isLoggedIn ? <CourseList /> : <Navigate to="/" />
            } />
            <Route path="/lesson/:id" element={
              isLoggedIn ? <LessonDetail user={user} /> : <Navigate to="/" />
            } />
            <Route path="/quiz/:lessonId" element={
              isLoggedIn ? <Quiz user={user} /> : <Navigate to="/" />
            } />
            <Route path="/practice" element={
              isLoggedIn ? <Practice /> : <Navigate to="/" />
            } />
            <Route path="/chatbot" element={
              isLoggedIn ? <ChatBot /> : <Navigate to="/" />
            } />
            <Route path="/account" element={
              isLoggedIn ? <Account user={user} /> : <Navigate to="/" />
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              isLoggedIn && user?.role === 'admin' 
                ? <AdminDashboard /> 
                : <Navigate to="/" />
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App;