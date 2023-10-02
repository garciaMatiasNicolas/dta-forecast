import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage.js';
import LogIn from '../pages/LogIn.js';
import SignUp from '../pages/SignUp.js';
import Dashboard from '../pages/Dashboard.js';
import Profile from '../pages/Profile.js';
import ToolsPage from '../pages/Tools.js';
import TemplatesPage from '../pages/tools/TemplatesPage.js';
import ExplorationPage from '../pages/tools/ExplorationPage.js';
import VolumePage from '../pages/tools/VolumePage.js';
import CollaborationPage from '../pages/tools/CollaborationPage.js';
import KpisPage from '../pages/tools/KpisPage.js';
import RunModelsPage from '../pages/RunModelsPage.js';

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
        <Route path='/tools/:idProyecto' element={<PrivateRoute element={<ToolsPage />} />} >
          <Route path='uploads' element={<TemplatesPage />} />
          <Route path='exploration' element={<ExplorationPage />} />
          <Route path='params' element={<RunModelsPage />} />
          <Route path='forecast' element={<VolumePage />} />
          <Route path='colaborations' element={<CollaborationPage />} />
          <Route path='kpis' element={<KpisPage />} />
        </Route>
        <Route path='/profile' element={<PrivateRoute element={<Profile />} />}/>
      </Routes>
    </Router>
  );
};

export default AppRouter;

