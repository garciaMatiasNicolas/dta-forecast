import Plot from 'react-plotly.js';

const GraphAllocationMatrix = ({ correlationMatrix }) => {
  // Obtener las claves únicas de las variables exógenas y productos SKU
  const variables = Object.keys(correlationMatrix[Object.keys(correlationMatrix)[0]]);
  const value = Object.keys(correlationMatrix);

  // Crear listas de valores para los ejes X, Y y Z del gráfico de heatmap
  const xValues = variables.map((variable) => variable);
  const yValues = value.map((value) => value);
  const zValues = value.map((value) => variables.map((variable) => correlationMatrix[value][variable]));

  const data = [
    {
      z: zValues,
      x: xValues,
      y: yValues,
      type: 'heatmap',
      colorscale: 'YlOrRd',
      zmin: -1, 
      zmax: 1,  
      hovertemplate: 'Producto: %{y}<br>Variable: %{x}<br>Correlación: %{z}',
    },
  ];

  return (
    <div className='d-flex justify-content-start align-items-start flex-column'>
      <Plot
        data={data}
        layout={{
          width: 800,
          height: 600,
          xaxis: {
            title: 'Variable Exógena',
            side: 'top'
          }
        }}
      />
    </div>
  );
};

export default GraphAllocationMatrix;

