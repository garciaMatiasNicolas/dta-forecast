import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import EmptyLineChart from '../../../components/admin/tools/volume/EmptyChartLine';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
); 

const GraphMape = ({ scenario, graphicData }) => {
    // Graph options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    // Graph data - En un gráfico de torta, los datos son un arreglo de valores y un arreglo de colores correspondientes
    const dataPie = {
        labels: graphicData.models, // Etiquetas de las secciones
        datasets: [
            {
                data: graphicData.avg, // Valores para cada sección
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    // Puedes añadir más colores si tienes más secciones
                ],
            },
        ],
    };

    return (
        <div className='w-auto mt-5 d-flex justify-content-center align-items-center flex-column'>
            <p className="text-primary w-auto m-0 p-0">Grafico Modelos</p>
            <div style={{ width: '400px', height: '400px' }}>
                {scenario === 0 ? <EmptyLineChart /> : <Pie  options={options} data={dataPie} />}
            </div>
        </div>
    )
}

export default GraphMape;
