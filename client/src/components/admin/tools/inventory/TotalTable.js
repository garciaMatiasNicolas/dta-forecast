import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import React, { useEffect, useState } from "react";

const TotalTable = ({ data }) => {
    const [totalData, setTotalData] = useState({});

    useEffect(() => {
        calculateTotals();
    }, [data]);

    const calculateTotals = () => {
        if (data) {
            const totalSobranteValorizado = data.reduce((accumulator, currentValue) => {
                // Sumar el valor de "Sobrante valorizado" al acumulador
                return accumulator + parseFloat(currentValue["Sobrante valorizado"]);
            }, 0); // Inicializar el acumulador en 0

            const totalValorizado = data.reduce((accumulator, currentValue) => {
                // Sumar el valor de "Valorizado" al acumulador
                return accumulator + parseFloat(currentValue["Valorizado"]);
            }, 0); // Inicializar el acumulador en 0

            // Crear un objeto con los totales
            const totalsObject = {
                "Sobrante valorizado": totalSobranteValorizado.toFixed(2),
                "Valorizado": totalValorizado.toFixed(2)
            };

            // Actualizar el estado con el objeto de totales
            setTotalData(totalsObject);
        }
    };

    const renderRows = () => {
        return Object.keys(totalData).map((key, index) => (
            <tr key={index}>
                <td>{key}</td>
                <td>{totalData[key]}</td>
            </tr>
        ));
    };


    return (
        <div>
            <h5 className="text-primary mb-3 mt-3">Tabla de totales</h5>
            <MDBTable hover className='w-auto'>
                <MDBTableHead className='bg-primary'>
                    <tr className='w-auto h-auto border'>
                        <th className='text-white border text-center'>Categoría</th>
                        <th className='text-white border text-center'>Total</th>
                    </tr>
                </MDBTableHead>
                <MDBTableBody>
                    {renderRows()}
                </MDBTableBody>
            </MDBTable>
        </div>
    );
};

export default TotalTable;
