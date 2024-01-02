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

const GraphMape = ({errorName, scenario, graphicData}) => {
    // Graph options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    const reversedX = Array.isArray(graphicData.x) ? graphicData.x.reverse() : [];
    const reversedY = Array.isArray(graphicData.y) ? graphicData.y.reverse() : [];

    // Graph data
    const dataBar = {
        labels: reversedX,
        datasets: [
            {
                label: `${errorName} por mes`,
                data: reversedY,
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            }
        ],
    }; 


    return (
        <div className='w-50 mt-5'>
            <p className="text-primary w-auto m-0 p-0">{errorName} último año</p>
            {scenario === 0 ? <EmptyLineChart/> : <Bar options={options} data={dataBar} />}
        </div>
    )
}

export default GraphMape;