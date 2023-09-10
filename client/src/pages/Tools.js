import Navbar from "../components/navs/Navbar"
import ToolContainer from "../containers/admin/ToolContainer"

const ToolsPage = () => {
  return (
    <div>
        <Navbar/>
        <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-center gap-3 align-items-center p-3 bg-white">
          <ToolContainer/>
        </main> 
    </div>
  )
}

export default ToolsPage