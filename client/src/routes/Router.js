import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.js';
import LogIn from '../pages/LogIn.js';
import SignUp from '../pages/SignUp.js';
import Dashboard from '../pages/Dashboard.js';
import Profile from '../pages/Profile.js';
import ToolsPage from '../pages/Tools.js';

const isUserAuthenticated = () => {
  const userToken = localStorage.getItem('userToken');
  return !!userToken;
};

const PrivateRoute = ({ element }) => {
  return isUserAuthenticated() ? element : <Navigate to="/login" />;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LandingPage/>} />
        <Route path="/login" element={<LogIn/>} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path='/dashboard' element={<PrivateRoute element={<Dashboard />} />}/>
        <Route path='/tools/:idProyecto' element={<PrivateRoute element={<ToolsPage />} />} />
        <Route path='/profile' element={<PrivateRoute element={<Profile />} />}/>
      </Routes>
    </Router>
  );
};

export default AppRouter;

