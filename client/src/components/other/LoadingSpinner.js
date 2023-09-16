import { css } from '@emotion/react';
import { ScaleLoader } from 'react-spinners';

const override = css`
  display: block;
  margin: 0 auto;
`;

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
        <h5>Cargando data, esto puede demorar unos minutos..</h5>
        <ScaleLoader css={override} color="#007BFF" loading />
    </div>
  );
};

export default LoadingSpinner;
