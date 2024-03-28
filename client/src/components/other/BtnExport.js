import axios from "axios";
import { MDBBtn, MDBIcon } from "mdb-react-ui-kit"

const apiUrl = process.env.REACT_APP_API_URL;

const BtnExport = ({rows, columns, fileName}) => {
    // AUTHORIZATION HEADERS //
    const token = localStorage.getItem("userToken");
    const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
    };
    
    const handleExportExcel = () => {
        const dataToSend = {
            "columns": columns,
            "rows": rows,
            "file_name": fileName,
            "project_pk": parseInt(localStorage.getItem("projectId"))
        }
        
        axios.post(`${apiUrl}/export_excel`, dataToSend, {
            headers: headers,
            responseType: 'blob'
        })
        .then(res => {
            const file = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileURL = URL.createObjectURL(file);

            const a = document.createElement('a');
            a.href = fileURL;
            a.download = `${fileName}.xlsx`; 
            document.body.appendChild(a);
            a.click();

        
            window.URL.revokeObjectURL(fileURL);
            document.body.removeChild(a);
        })
        .catch(err => console.log(err)) 
    }

    return (
        <MDBBtn className="w-auto mb-4" style={{ backgroundColor: '#25d366' }} onClick={handleExportExcel}>
            Exportar como Excel
            <MDBIcon className="ms-2" fas icon="file-export" />
        </MDBBtn> 
    )
};

export default BtnExport;