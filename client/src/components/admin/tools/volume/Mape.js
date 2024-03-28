const Mape = ({errorType, mainError, errorLastPeriod, errorAbs}) => {
  return (
    <div className="w-auto" style={{"minWidth": "265PX"}}>
      <div className="w-100 border rounded">
        <div className="p-1" style={{"backgroundColor": "#626266"}}>
          <h6 className="text-center text-white">{errorType === '' ? 'Error' : errorType}</h6>
        </div>
        
        <div className="p-1" style={{"backgroundColor": "rgba(43, 127, 214, 0.08)"}}>
          <p className="text-center text-black">{mainError}</p>
        </div>
      </div>

      <div className="w-100 border rounded">
        <div className="p-1" style={{"backgroundColor": "#626266"}}>
          <h6 className="text-center text-white">{errorType === '' ? 'Error' : errorType} último periodo</h6>
        </div>
        
        <div className="p-1" style={{"backgroundColor": "rgba(43, 127, 214, 0.08)"}}>
          <p className="text-center text-black">{errorLastPeriod}</p>
        </div>
      </div>

      <div className="w-100 border rounded">
        <div className="p-1" style={{"backgroundColor": "#626266"}}>
          <h6 className="text-center text-white">{errorType === '' ? 'Error' : errorType} ABS último periodo</h6>
        </div>
        
        <div className="p-1" style={{"backgroundColor": "rgba(43, 127, 214, 0.08)"}}>
          <p className="text-center text-black">{errorAbs}</p>
        </div>
      </div>
    </div>
  )
}

export default Mape