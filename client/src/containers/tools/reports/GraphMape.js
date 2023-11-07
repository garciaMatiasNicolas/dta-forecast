import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import EmptyLineChart from '../../../components/admin/tools/volume/EmptyChartLine';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement, 
);

const GraphMape = ({scenario, graphicData}) => {
    // Graph options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    // Graph data
    const dataBar = {
        labels: graphicData.x,
        datasets: [
            {
                label: 'MAPE por mes',
                data: graphicData.y,
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            }
        ],
    }; 


    return (
        <div className='w-50 mt-5'>
            <p className="text-primary w-auto m-0 p-0">Mape último año</p>
            {scenario === 0 ? <EmptyLineChart/> : <Bar options={options} data={dataBar} />}
            {console.log(graphicData)}
        </div>
    )
}

export default GraphMape;