import { useNavigate } from "react-router-dom";
import Tools from "../Tools";
import NavInventory from "../../../navs/NavInventory";



const InventoryTools = () => {
    
    const navigate = useNavigate();

    const handleNavigateSafetyStock = () => {
        navigate("/safety-stock");
    };

    const handleNavigateStock = () => {
        navigate("/stock");
    };

    const handleNavigateDRP = () => {
        navigate("/drp");
    };


    const safetyStock = {
        title: "Stock de seguridad",
        text: "Cálculo de Stock de seguridad",
        icon: "truck-loading",
        handleClick: handleNavigateSafetyStock
       
    };

    const stockByProduct = {
        title: "Reapro & Semáforo",
        text: "Cálculo de Reapro y Semáforo",
        icon: "traffic-light",
        handleClick: handleNavigateStock 
       
    };

    const drp = {
        title: "DRP sucursales",
        text: "Distribución y compra",
        icon: "map-marked-alt",
        handleClick: handleNavigateDRP
    }
    
    return(
 
        <div className="d-flex w-auto justify-content-center align-items-start gap-3 flex-column">
            <NavInventory/>

            <div className="d-flex w-auto justify-content-center align-items-center gap-1 flex-wrap">
                <Tools props={safetyStock}/>
                <Tools props={stockByProduct}/>
                <Tools props={drp} />
            </div>
        </div>

    )
};

export default InventoryTools;