import GropuButtonActions from "./GropuButtonActions"

const Templates = ({props}) => {
  return (
    <tr>
      <th>{props.name}</th>
      <td className='d-flex justify-content-end'>
        <GropuButtonActions props={props.name}/>
      </td>
    </tr>
  )
}

export default Templates