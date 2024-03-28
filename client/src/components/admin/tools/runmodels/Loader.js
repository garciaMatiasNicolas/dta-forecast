import React from 'react'
import { BarLoader } from 'react-spinners'

const Loader = ({stateLoader}) => {
  return (
    stateLoader &&
    <div className='mt-5 rounded d-flex justify-content-center align-items-center flex-column' style={{ position: 'fixed', top: '10px', right: '10px', padding: '40px', background: '#3498db', width: "auto", zIndex: 9999}}>
        <p className='text-white'>Corriendo modelos..</p>
        <BarLoader color='#ff8a00' width={150} height={5}/>
    </div>
  )
}

export default Loader
