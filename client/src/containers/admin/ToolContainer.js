import Tools from "../../components/admin/tools/Tools";
import data from "../../data/navigation.js";

const ToolContainer = () => {
    
  return (
    <div style={{"maxWidth": "800px"}} className="d-flex w-auto justify-content-center align-items-center gap-1 flex-wrap">
      {data.map(item => (
        <Tools key={item.id} props={item} />
      ))}
    </div>
  )
}

export default ToolContainer