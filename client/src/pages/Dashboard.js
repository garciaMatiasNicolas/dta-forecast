import SearchProject from "../components/admin/projects/SearchProject";
import Navbar from "../components/navs/Navbar";
import ProjectsContainer from "../containers/admin/ProjectsContainer";
import UserContainer from "../containers/admin/UserContainer";
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { showErrorAlert } from '../components/other/Alerts';
import { useNavigate } from 'react-router-dom';
import Loader from "../components/admin/tools/runmodels/Loader";
import { AppContext } from "../context/Context";

const apiUrl = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  
  const [projects, setProjects] = useState([]);
  const { loader } = useContext(AppContext);
  
  const createProject = (newProject) => {
    setProjects([...projects, newProject]);
  }

  const updateProjectById = () => {
    let token = localStorage.getItem("userToken");
  
    const headers = {
      'Authorization': `Token ${token}`, 
      'Content-Type': 'application/json', 
    };

    axios.get(`${apiUrl}/projects`, {headers})
    .then(res => {
      setProjects(res.data);
    })
    .catch(err => {
      showErrorAlert("Su sesion expirado, debe iniciar sesion nuevamente");
      localStorage.clear();
      navigate("/login/");
    });
  };

  const deleteProjectById = (projectId) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
  };

  const setSearchedProject = (data) => {
    setProjects(data);
  }
  

  let navigate = useNavigate();

  useEffect(() => {
    let token = localStorage.getItem("userToken");
  
    const headers = {
      'Authorization': `Token ${token}`, 
      'Content-Type': 'application/json', 
    };

    axios.get(`${apiUrl}/projects`, {headers})
    .then(res => {
      setProjects(res.data);
    })
    .catch(err => {
      showErrorAlert("Su sesion expirado, debe iniciar sesion nuevamente");
      localStorage.clear();
      navigate("/login/");
    });

  }, []);
  
  return (
    <>
      <Navbar/>
      <Loader stateLoader={loader} />
      <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-center gap-3 align-items-center p-3 bg-white">
        <UserContainer createProject={createProject}/>
        {
          projects.length === 0 ? <div>No hay proyectos creados, cree uno para iniciar su forecast</div> : 
          <>
            <SearchProject setSearchedProject={setSearchedProject} updateProject={updateProjectById}/>
            <ProjectsContainer projects={projects} deleteProject={deleteProjectById} updateProject={updateProjectById} />
          </>
        }
      </main> 
    </>
  )
}

export default Dashboard