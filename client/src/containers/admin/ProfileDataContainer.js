import { useState } from 'react';
import {
    MDBCard,
    MDBCardBody,
    MDBCardHeader,
    MDBTabs,
    MDBTabsItem,
    MDBTabsLink,
} from 'mdb-react-ui-kit';
import ProfileUpdate from '../../components/admin/user/ProfileUpdate';
import ProfileInfo from '../../components/admin/user/ProfileInfo';
  
const ProfileDataContainer = ({dataProfile}) => {
    
    const [update, setUpdate] = useState(false);

    console.log(dataProfile);

    return (
      <MDBCard className='text-center w-75' style={{"maxWidth": "900px"}}>
        <MDBCardHeader>
          <MDBTabs className='card-header-tabs'>
            <MDBTabsItem>
              <MDBTabsLink onClick={()=>{setUpdate(false)}}>
                Mis datos
              </MDBTabsLink>
            </MDBTabsItem>
            {/* <MDBTabsItem>
              <MDBTabsLink onClick={()=>{setUpdate(true)}} >
                Actualizar Informacion
              </MDBTabsLink>
            </MDBTabsItem> */}
          </MDBTabs>
        </MDBCardHeader>
        <MDBCardBody>
        
         <ProfileInfo data={dataProfile}/>
       
        </MDBCardBody>
      </MDBCard>
    );
}

export default ProfileDataContainer;