import {MDBTableBody, MDBIcon } from 'mdb-react-ui-kit';

const ScenarioPredictions = ({ scenario }) => {
    const handleDownload = () => {
      const link = document.createElement("a");
      link.href = scenario.url_predictions;
      link.download = `predicciones_${scenario.scenario_name}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    return (
      <MDBTableBody>
        <tr>
          <th scope='row'>{scenario.id}</th>
          <td>{scenario.scenario_name}</td>
          <td style={{ cursor: "pointer" }} onClick={handleDownload}>
            <MDBIcon fas icon='file-excel' /> Excel Predicciones
          </td>
          <td>{scenario.file_id}</td>
        </tr>
      </MDBTableBody>
    );
};
  

export default ScenarioPredictions