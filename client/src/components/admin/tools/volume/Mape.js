

const Mape = ({mape}) => {
  return (
    <div className="w-100 border rounded">
        <div className="p-1" style={{"backgroundColor": "#626266"}}>
            <h6 className="text-center text-white">MAPE</h6>
        </div>
        <div className="p-1" style={{"backgroundColor": "rgba(43, 127, 214, 0.08)"}}>
            <p className="text-center text-black">{mape}</p>
        </div>
    </div>
  )
}

export default Mape