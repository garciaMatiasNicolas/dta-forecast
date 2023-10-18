import axios from "axios";
import { showErrorAlert } from "../../other/Alerts";

const apiUrl = process.env.REACT_APP_API_URL;

const SearchProject = ({setSearchedProject, updateProject}) => {

  const headers = {
    'Authorization': `Token ${localStorage.getItem('userToken')}`, 
    'Content-Type': 'application/json', 
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
  };

  const handleInputChange = (e) => {
    const projectName = e.target.value;
    const requestData = { project_name: projectName };

    if (projectName !== ''){
      axios.post(`${apiUrl}/search-project`, requestData, { headers })
        .then(response => {
          response.data.message ? updateProject() : setSearchedProject(response.data);
        })
        .catch(error => {
          showErrorAlert(`Ocurrio un error inesperado: STATUS${error.status} ${error.response.data.error}`);
        });
    } 
  };

  return (
    <div className="w-100 ">
        <form onSubmit={handleFormSubmit} className='d-flex input-group container'>
          <input 
            type='search' 
            name="projectName" 
            className='form-control' 
            placeholder='Buscar proyecto por nombre' 
            aria-label='Search' 
            onChange={handleInputChange}
          />
        </form>
    </div>
  )
}

export default SearchProject

