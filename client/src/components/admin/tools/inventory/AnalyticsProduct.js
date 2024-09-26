import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';

const AnalyticsProduct = ({ data }) => {
  if (!data || !data.graphic_historical || !data.graphic_forecast) {
    return <div>Loading...</div>; // Mostrar un mensaje de carga mientras se obtienen los datos
  }

  const options = {
    title: {
      text: 'Historical and Forecast Data',
    },
    xAxis: {
      categories: data.graphic_historical.dates,
    },
    series: [
      {
        name: 'Actual',
        data: data.graphic_historical.values,
        color: 'rgb(255, 99, 132)',
      },
      {
        name: 'Forecast',
        data: data.graphic_forecast.values,
        color: 'rgb(53, 162, 235)',
      },
    ],
    plotOptions: {
      line: {
        marker: {
          enabled: false,
        },
      },
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              enabled: false,
            },
          },
        },
      ],
    },
  };

  return (
    <div className="w-100 d-flex justify-content-start align-items-start flex-column gap-5">
      <div className="w-100 d-flex justify-content-start align-items-start">
        <div className="w-75">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
        <div className="w-25">
          <div className="w-auto mt-4" style={{ minWidth: '265px' }}>
            <div className="w-100 border rounded">
              <div className="p-1" style={{ backgroundColor: '#626266' }}>
                <h6 className="text-center text-white">ERROR</h6>
              </div>

              <div className="p-1" style={{ backgroundColor: 'rgba(43, 127, 214, 0.08)' }}>
                <p className="text-center text-black">{data.error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MDBTable hover className="w-auto">
        <MDBTableHead className="bg-primary">
          <tr>
            <th scope="col" className="text-white">SKU</th>
            {data.kpis.columns.map((col, index) => (
              <th scope="col" className="text-white" key={index}>{col}</th>
            ))}
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          <tr>
            <td>{data.product}</td>
            {data.kpis.values.map((value, index) => (
              <td key={index} className="text-center">{value}</td>
            ))}
          </tr>
        </MDBTableBody>
      </MDBTable>
    </div>
  );
};

export default AnalyticsProduct;
