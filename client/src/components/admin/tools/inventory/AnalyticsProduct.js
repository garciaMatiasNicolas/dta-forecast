import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

const AnalyticsProduct = ({data}) => {

    if (!data || !data.graphic_historical || !data.graphic_forecast) {
        return <div>Loading...</div>; // Mostrar un mensaje de carga mientras se obtienen los datos
      }
    
      const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      };
    
      const dataGraph = {
        labels: data.graphic_historical.dates,
        datasets: [
          {
            label: 'Actual',
            data: data.graphic_historical.values,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Predecido',
            data: data.graphic_forecast.values,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          }
        ]
      };
    
      return (
        <div className='w-100 d-flex justify-content-start align-items-start flex-column gap-5'>
            <div className='w-100 d-flex justify-content-start align-items-start'>
                <div className='w-75'>
                    <Line options={options} data={dataGraph} />
                </div>
                <div className='w-25'>
                    <div className="w-auto mt-4" style={{"minWidth": "265PX"}}>
                        <div className="w-100 border rounded">
                            <div className="p-1" style={{"backgroundColor": "#626266"}}>
                                <h6 className="text-center text-white">ERROR</h6>
                            </div>
                            
                            <div className="p-1" style={{"backgroundColor": "rgba(43, 127, 214, 0.08)"}}>
                                <p className="text-center text-black">{data.error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MDBTable hover className='w-auto'>
                <MDBTableHead className='bg-primary'>
                    <tr>
                    <th scope='col' className='text-white'>SKU</th>
                    {data.kpis.columns.map((col, index) => (
                        <th scope='col' className='text-white' key={index}>{col}</th>
                    ))}
                    </tr>
                </MDBTableHead>
                <MDBTableBody>
                    <tr>
                    <td>{data.product}</td>
                    {data.kpis.values.map((value, index) => (
                        <td key={index} className='text-center'>{value}</td>
                    ))}
                    </tr>
                </MDBTableBody>
            </MDBTable>
        </div>
    );

};

export default AnalyticsProduct;