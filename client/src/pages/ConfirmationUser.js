import { useNavigate } from "react-router-dom";
import photo from "../assets/confirmation.png";
import React, { useEffect } from 'react';

const ConfirmationUser = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/login");
    }, 3000);

  }, []);

  return (
    <div className="w-100 h-100 d-flex justify-center align-items-center gap-5">
      <img src={photo} style={{"maxWidth": "600px"}}/>
      <div className="d-flex flex-column justify-content-center align-items-center gap-2">
        <h1 className="text-white text-center">Email confirmado exitosamente</h1>
        <p className="text-white text-center">Redirigiendo..</p>
      </div>
    </div>
  )
}

export default ConfirmationUser