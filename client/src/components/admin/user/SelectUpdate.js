import { MDBBtn, MDBIcon } from "mdb-react-ui-kit"

const SelectUpdate = () => {
  return (
    <div className="w-auto mb-4 ms-5">
        <MDBBtn className='mx-2' tag='a' color='success' outline floating>
            <MDBIcon fas icon='check' />
        </MDBBtn>
        
        <MDBBtn className='mx-2' tag='a' color='danger' outline floating>
            <MDBIcon fas icon='times' />
        </MDBBtn>
    </div>
  )
}

export default SelectUpdate