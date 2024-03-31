import InventoryTools from "../../components/admin/tools/inventory/InventoryTools";
import Navbar from "../../components/navs/Navbar";

const InventoryPage = () => {
    return(
        <div>
            <Navbar/>
            <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-center gap-3 align-items-center p-5 bg-white w-100">
                <InventoryTools/>
            </main>
        </div>
    );
}

export default InventoryPage;