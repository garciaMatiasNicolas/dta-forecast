import React from 'react';
import { Line } from 'react-chartjs-2';
import {ClipLoader} from 'react-spinners'

const ModelsGraphicByProduct = ({ data, productChanged }) => {
    if (productChanged) {
        // Mostrar un mensaje de carga mientras los datos están siendo procesados
        return <div><ClipLoader /></div>;
    }

    if (!data || Object.keys(data).length === 0 ) {
        return <div></div>;
    }

    return (
        <div className='w-100'>
            <Line data={data} />
        </div>
    );
};

export default ModelsGraphicByProduct;
