import {
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBIcon
} from 'mdb-react-ui-kit';


const Tools = ({props}) => {
  return (
    <MDBCard style={{"width": "19rem", "cursor": "pointer"}} alignment='center' className='hover-shadow border'>
      <MDBCardBody>
        <MDBCardTitle>{props.title}</MDBCardTitle>
        <MDBCardText>{props.text}</MDBCardText>
        <MDBIcon fas icon={props.icon} size='6x' color='primary'/>
      </MDBCardBody>
    </MDBCard>
  )
}

export default Tools