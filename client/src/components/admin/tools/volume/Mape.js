const Mape = ({mape, mapeLastPeriod, mapeAbs}) => {
  return (
    <div className="w-auto" style={{"minWidth": "265PX"}}>
      <div className="w-100 border rounded">
        <div className="p-1" style={{"backgroundColor": "#626266"}}>
          <h6 className="text-center text-white">MAPE últimos 12 periodos</h6>
        </div>
        
        <div className="p-1" style={{"backgroundColor": "rgba(43, 127, 214, 0.08)"}}>
          <p className="text-center text-black">{mape}</p>
        </div>
      </div>

      <div className="w-100 border rounded">
        <div className="p-1" style={{"backgroundColor": "#626266"}}>
          <h6 className="text-center text-white">MAPE último periodo</h6>
        </div>
        
        <div className="p-1" style={{"backgroundColor": "rgba(43, 127, 214, 0.08)"}}>
          <p className="text-center text-black">{mapeLastPeriod}</p>
        </div>
      </div>

      <div className="w-100 border rounded">
        <div className="p-1" style={{"backgroundColor": "#626266"}}>
          <h6 className="text-center text-white">MAPE ABS último periodo</h6>
        </div>
        
        <div className="p-1" style={{"backgroundColor": "rgba(43, 127, 214, 0.08)"}}>
          <p className="text-center text-black">{mapeAbs}</p>
        </div>
      </div>
    </div>
  )
}

export default Mape