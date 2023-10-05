import SearchProject from "../components/admin/projects/SearchProject";
import Navbar from "../components/navs/Navbar";
import ProjectsContainer from "../containers/admin/ProjectsContainer";
import UserContainer from "../containers/admin/UserContainer";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { showErrorAlert } from '../components/other/Alerts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  
  const [projects, setProjects] = useState([]);
  
  const createProject = (nuevoProyecto) => {
    setProjects([...projects, nuevoProyecto]);
  }
  
  let navigate = useNavigate();

  useEffect(() => {
    let token = localStorage.getItem("userToken");
  
    const headers = {
      'Authorization': `Token ${token}`, 
      'Content-Type': 'application/json', 
    };

    axios.get("http://localhost:8000/projects", {headers})
    .then(res => {
      setProjects(res.data);
    })
    .catch(err => {
      showErrorAlert("Su sesion expirado, debe iniciar sesion nuevamente");
      localStorage.clear();
      navigate("/login/");
    });

  }, [projects])
  
  return (
    <>
      <Navbar/>
      <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-center gap-3 align-items-center p-3 bg-white">
        <UserContainer createProject={createProject}/>
        {
          projects.length === 0 ? <div>No hay proyectos creados, cree uno para iniciar su forecast</div> : 
          <>
            <SearchProject/>
            <ProjectsContainer projects={projects}/>
          </>
        }
      </main> 
    </>
  )
}

export default Dashboard