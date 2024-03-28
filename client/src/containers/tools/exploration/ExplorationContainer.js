import GraphExploration from '../../../components/admin/tools/exploration/GraphExploration';
import Outliers from '../../../components/admin/tools/exploration/Outliers';
import TableExogenousVariables from '../../../components/admin/tools/exploration/TableExogenousVariables';
import GraphExogenousVariables from '../../../components/admin/tools/exploration/GraphExogenousVariables';

const ExplorationContainer = () => {
  return (
    <div className='w-100 d-flex justify-content-start align-items-start gap-2 flex-column px-5' >
      <GraphExploration />
      <GraphExogenousVariables/>
      
      <div className='w-100 d-flex justify-content-start align-items-start gap-2 flex-column '>
        <Outliers/>
        <TableExogenousVariables/>
      </div>
    </div>
  )
}

export default ExplorationContainer