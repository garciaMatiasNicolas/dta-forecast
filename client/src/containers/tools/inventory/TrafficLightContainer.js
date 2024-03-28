import Table from "../../../components/admin/tools/inventory/TableWithAvg";
import TrafficLightChart from "../../../components/admin/tools/inventory/TrafficLightChart";

const TrafficLightContainer = ({data}) => {
    if (!data || data.length === 0) {
        return <div></div>;
    };
    
    return (
        <> 
            <h5 className='text-primary mt-5'>Semáforo de stock</h5>
            <Table data={data} />
            <div style={{ width: '800px', height: '400px' }} className="mb-5">
                <TrafficLightChart data={data} />
            </div>
        </>
    )
};

export default TrafficLightContainer;