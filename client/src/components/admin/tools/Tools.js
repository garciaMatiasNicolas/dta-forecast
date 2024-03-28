import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBIcon
} from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';


const Tools = ({props}) => {
  let navigate = useNavigate();
  
  const idProyecto = localStorage.getItem("projectId");

  const handleClick = () => {
    navigate(`/tools/project/${idProyecto}/${props.route}`);
  };
  
  return (
    <MDBCard onClick={!props.handleClick ? handleClick : props.handleClick} style={{"width": "19rem", "cursor": "pointer"}} alignment='center' className='hover-shadow border'>
      <MDBCardBody>
        <MDBCardTitle>{props.title}</MDBCardTitle>
        <MDBCardText>{props.text}</MDBCardText>
        <MDBIcon fas icon={props.icon} size='6x' color='primary'/>
      </MDBCardBody>
    </MDBCard>
  )
}

export default Tools