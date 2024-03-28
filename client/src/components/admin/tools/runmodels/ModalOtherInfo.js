import React from 'react';
import { MDBIcon } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2';

const ModalOtherInfo = ({scenarioInfo}) => {
    const handleShowInfo = () => {
        const modelsString = scenarioInfo.models.join(', ');
        
        const formattedParams = Object.entries(scenarioInfo.additional_params).map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value.join(', ')}`).join('\n');

        const alertText = `
            <div class='mt-3 d-flex justify-content-start align-items-start flex-column h-100'>
                <div class="d-flex justify-content-start align-items-start mb-2">
                    <p class="text-start">${modelsString}</p>
                </div>

                <div class="d-flex justify-content-start align-items-start mb-2 gap-2">
                    <p class='text-primary'>Método de error:</p>
                    <p>${scenarioInfo.error_type}</p>
                </div>
                
                <div class="d-flex justify-content-start align-items-start flex-column mb-2">
                    <p class='text-primary'>Parámetros adicionales:</p>
                    <pre class="text-start">${formattedParams}</pre>
                </div> 
                
                <div class="d-flex justify-content-start align-items-start mb-2 gap-2">
                    <p class='text-primary'>Periodos de entrenamiento:</p>
                    <p>${scenarioInfo.test_p}</p>
                </div> 

                <div class="d-flex justify-content-start align-items-start gap-2">
                    <p class='text-primary'>Periodos predecidos:</p>
                    <p>${scenarioInfo.pred_p}</p>
                </div> 

            </div>
        `;

        Swal.fire({
            icon: 'info',
            title: 'Información',
            html: alertText,
        });
    };

    return (
        <span onClick={handleShowInfo} style={{ cursor: 'pointer', marginLeft: '5px' }}>
            <MDBIcon fas icon='search' />
        </span>
    );
};

export default ModalOtherInfo;
