import { MDBCol, MDBRadio, MDBRow  } from 'mdb-react-ui-kit';

const TopDownDimensions = () => {
  return (
    <MDBCol size='md' >
      <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
        <span>Dimensiones de arriba abajo</span>
      </MDBRow>
      <form>
        <MDBRadio name='topdowndimensions' id='family' label='Familia'  />
        <MDBRadio name='topdowndimensions' id='region' label='Región' />
        <MDBRadio name='topdowndimensions' id='salesman' label='Vendedor '  />
        <MDBRadio name='topdowndimensions' id='client' label='Cliente' />
        <MDBRadio name='topdowndimensions' id='category' label='Categoría'  />
        <MDBRadio name='topdowndimensions' id='subcategory' label='Subcategoría' />
        <MDBRadio name='topdowndimensions' id='sku' label='Unidad de Control de Stock ' defaultChecked />
      </form>
    </MDBCol>
  )
}

export default TopDownDimensions