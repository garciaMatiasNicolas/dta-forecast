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
import KpisPage from '../pages/tools/KpisPage.js';
import RunModelsPage from '../pages/RunModelsPage.js';
import ConfirmationUser from '../pages/ConfirmationUser.js';
import DetailReportPage from '../pages/tools/DetailReportPage.js';
import MetricsAnalysisPage from '../pages/tools/MetricsAnalysisPage.js';
import InventoryPage from '../pages/tools/InventoryPage.js';
import SafetyStockContainer from '../containers/tools/inventory/SafetyStockContainer.js';
import InventoryContainer from '../containers/tools/inventory/InventoryContainer.js';
import DrpContainer from '../containers/tools/inventory/DrpContainer.js';

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
        <Route path='/inventory' element={<PrivateRoute element={<InventoryPage />} />} />
        <Route path='/uploads' element={<PrivateRoute element={<TemplatesPage />} />}/>
        <Route path='/safety-stock' element={<PrivateRoute element={<SafetyStockContainer />} />}/>
        <Route path='/stock' element={<PrivateRoute element={<InventoryContainer />} />}/>
        <Route path='/drp' element={<PrivateRoute element={<DrpContainer />} />}/>
        <Route path='/confirmation' element={<ConfirmationUser/>}/>
        <Route path='/tools/project/:idProyecto' element={<PrivateRoute element={<ToolsPage />} />} >
          <Route path='exploration' element={<ExplorationPage />} />
          <Route path='params' element={<RunModelsPage />} />
          <Route path='forecast' element={<VolumePage />} />
          <Route path='kpis' element={<KpisPage />} />
        </Route>
        <Route path='/profile' element={<PrivateRoute element={<Profile />} />}/>
        <Route path='/detail-report' element={<PrivateRoute element={<DetailReportPage />} />}/>
        <Route path='/metrics-analysis' element={<PrivateRoute element={<MetricsAnalysisPage/>} />}/>
      </Routes>
    </Router>
  );
};

export default AppRouter;

