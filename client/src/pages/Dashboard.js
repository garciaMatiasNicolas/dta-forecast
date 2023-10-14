import SearchProject from "../components/admin/projects/SearchProject";
import Navbar from "../components/navs/Navbar";
import ProjectsContainer from "../containers/admin/ProjectsContainer";
import UserContainer from "../containers/admin/UserContainer";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showErrorAlert } from '../components/other/Alerts';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  
  const [projects, setProjects] = useState([]);
  
  const createProject = (newProject) => {
    setProjects([...projects, newProject]);
  }

  const updateProjectById = (id, updatedProject) => {
    setProjects(prevProjects => {
      const updatedProjects = [...prevProjects];
      const projectIndex = updatedProjects.findIndex(project => project.id === id);
      if (projectIndex !== -1) {
        updatedProjects.splice(projectIndex, 1, updatedProject);
      } else {
        updatedProjects.push(updatedProject);
      }
    });
  };

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
      <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-center gap-3 align-items-center p-3 bg-white">
        <UserContainer createProject={createProject}/>
        {
          projects.length === 0 ? <div>No hay proyectos creados, cree uno para iniciar su forecast</div> : 
          <>
            <SearchProject/>
            <ProjectsContainer projects={projects} />
          </>
        }
      </main> 
    </>
  )
}

export default Dashboard