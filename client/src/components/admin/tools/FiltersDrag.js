import React from 'react'
import { filters } from '../../../data/filters'
import { MDBIcon } from 'mdb-react-ui-kit'
import axios from 'axios'
import { showErrorAlert } from '../../other/Alerts'


const apiUrl = process.env.REACT_APP_API_URL;

const FiltersDrag = (setGraphYear, setData, scenarioId) => {

    // AUTHORIZATION HEADERS //
    const token = localStorage.getItem("userToken");
    const headers = {
      'Authorization': `Token ${token}`, 
      'Content-Type': 'application/json', 
    };
  
    const getFirstGraph = () => {
        axios.get(`${apiUrl}/scenarios/${scenarioId}`, { headers })
        .then(res => {
            let graphicLineData =  res.data.final_data_pred;
            let graphicBarData = res.data.data_year_pred;
            
            const dataLine = {
                labels: graphicLineData.other_data.x,
                datasets: [
                {
                    label: 'Actual',
                    data: graphicLineData.actual_data.y,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
                {
                    label: 'Predecido',
                    data: graphicLineData.other_data.y,
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                }
                ]
            }; 

            const dataBar = {
                labels: graphicBarData.other_data.x,
                datasets: [
                {
                label: 'Actual',
                data: graphicBarData.actual_data.y,
                backgroundColor: 'rgba(255, 99, 132, 0.5)'
                },
                {
                label: 'Predecido',
                data: graphicBarData.other_data.y,
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                },
                ],
            };

            /* setData(dataLine); */
            setGraphYear(dataBar);
        })
        .catch(err => {
            if (err.response.status === 401) { showErrorAlert("Su sesion ha expirado, debe iniciar sesion nuevamente"); }
           /*  if (err.response.status === 404) { setData(false) } */
        })
    }

  return (
    <div className='w-auto d-flex justify-content-start alignt-items-center gap-5 flex-wrap'>
      {filters.map((item) => (
        item.name !== 'SKU' &&
        <div
          key={item.name}
          className='w-auto'
          draggable='true'
          /*  onDragStart={(e) => handleDragStart(e, item.name)} */
          style={{ cursor: 'pointer' }}
        >
          <div className='d-flex justify-content-start align-items-center gap-1 w-auto'>
            <MDBIcon icon={item.icon} color='primary' />
            <p className='mt-3 text-primary'>{item.label}</p>
          </div>
        </div>))
      }
      <p className="text-primary mt-3" onClick={getFirstGraph} style={{cursor: "pointer"}}>Reestablecer</p>
    </div>
  )
}

export default FiltersDrag
