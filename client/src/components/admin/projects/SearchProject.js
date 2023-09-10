import { MDBBtn, MDBIcon } from "mdb-react-ui-kit"


const SearchProject = () => {
  return (
    <div className="w-100 ">
        <form onSubmit={(e)=>{e.preventDefault()}} className='d-flex input-group container'>
            <input type='search' className='form-control' placeholder='Buscar proyecto por nombre' aria-label='Search' />
            <MDBBtn color='primary' className="d-flex justify-content-center align-items-center gap-2">
                <span>Buscar</span>
                <MDBIcon fas icon="search"/>
            </MDBBtn>
          </form>
    </div>
  )
}

export default SearchProject