import SafetyStock from "../../../components/admin/tools/inventory/SafetyStock";
import Navbar from "../../../components/navs/Navbar"

const SafetyStockContainer = () => {
    return (
        <div>
            <Navbar/>
            <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-5 bg-white w-100">
                <h5 className="text-primary">Calculo de stock de seguridad</h5>
                <SafetyStock/>
            </main>
        </div>
    );
};

export default SafetyStockContainer;