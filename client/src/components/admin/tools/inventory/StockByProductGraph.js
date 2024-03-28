import { Line } from "react-chartjs-2";


const GraphStockByProduct = ({data, sku}) => {
    const chartData = {
        labels: data.dates,
        datasets: [
            {
                label: 'Stock',
                data: data.stock,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                fill: true,
            },
            {
                label: 'Sales',
                data: data.sales,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                fill: true,
            },
        ],
    };

    const options = {
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'month',
              },
            },
          ],
        },
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
        },
        title: {
            display: true,
            text: `Stock de producto ${sku}`,
            fontSize: 16,
        }
    };

    return (
        <Line data={chartData} options={options} />
    );
}

export default GraphStockByProduct;