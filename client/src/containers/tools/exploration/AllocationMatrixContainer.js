import GraphAllocationMatrix from '../../../components/admin/tools/exploration/GraphAllocationMatrix';

const AllocationMatrixContainer = () => {

  return (
    <div className="d-flex flex-column justify-content-start align-items-start gap-3 mt-2 ms-5">
      <h5 className='text-primary'>Gráfico de correlación de Variables exógenas</h5>
      <GraphAllocationMatrix/>
    </div>
  )
}

export default AllocationMatrixContainer
