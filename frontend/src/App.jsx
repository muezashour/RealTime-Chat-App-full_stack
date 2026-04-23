import React, { useEffect } from 'react'
import NavBar from './components/NavBar'
import { Routes, Route, Navigate } from 'react-router-dom'
import LogInPage from './Pages/LogInPage'
import SignUpPage from './Pages/SignUpPage'
import SettingsPage from './Pages/SettingPage'
import HomePage from './Pages/HomePage'
import ProfilePage from './Pages/ProfilePage'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from "lucide-react"
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'

const App = () => {
  const {theme} = useThemeStore()
  const { checkAuth, authUser, isChekingAuth, onlineUsers } = useAuthStore()

  console.log("ONLINE USERS:", onlineUsers)
  useEffect(() => {
    checkAuth()
  }, [checkAuth])
  console.log(authUser)
  if (isChekingAuth && !authUser) {
    return (
      <div className ='flex items-center justify-center h-screen'>
        <Loader className="w-10 h-10 animate-spin" />
      </div>
    );
  }
  return (
    <div className='pt-16' data-theme={theme} >
      <NavBar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage />: <Navigate to="LogIn"/>} />
        <Route path="/SignUp" element={!authUser ? <SignUpPage />:<Navigate to="/"/> } />
        <Route path="/LogIn" element={!authUser ? <LogInPage /> :<Navigate to="/"/>} />
        <Route path="/Settings" element={<SettingsPage  />} />
        <Route path="/Profile" element={authUser ? <ProfilePage/> : <Navigate to="LogIn"/>} />
      </Routes>
      <Toaster />
    </div>
  )
}
export default App
