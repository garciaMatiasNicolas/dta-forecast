import GropuButtonActions from "./GropuButtonActions"

const Templates = ({props}) => {
  return (
    <tr>
      <th>{props.name}</th>
      <td className='d-flex justify-content-end'>
        <GropuButtonActions tableName={props.tableName} path={props.name} idFile={props.id}/>
      </td>
    </tr>
  )
}

export default Templates