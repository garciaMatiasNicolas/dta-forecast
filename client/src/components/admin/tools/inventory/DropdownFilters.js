import React, {useEffect, useState} from 'react';
import {
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
    MDBIcon,
    MDBInput,
} from 'mdb-react-ui-kit';
import { ClipLoader } from 'react-spinners';

const DropdownFilters = ({name, data, setFilterData, isOrderBy}) => {
  const [basicModal, setBasicModal] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [firstData, setFirstData] = useState(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderType, setOrderType] = useState(null);
 
  const toggleOpen = (name) => {
    if (isOrderBy) {
      if (orderType === null) {
        // Order ascendent
        setOrderType("asc");
        setFilterData(firstData.sort((a, b) => a[name] - b[name]));
      } else if (orderType === "asc"){
        // Order descendent
        setOrderType("desc");
        setFilterData(firstData.sort((a, b) => b[name] - a[name]));
      } else if (orderType === "desc"){
        // First
        setOrderType(null);
        setFilterData(firstData);
      };
      
    } else {
      setBasicModal(!basicModal);
    }
  };

  
  const getUniqueValuesByKey = (array, key) => {
    setLoadingData(true)
    
    if(Array.isArray(array)) {
      const uniqueValues = new Set();
      array.forEach(item => {
        if (item.hasOwnProperty(key)) {
          uniqueValues.add(item[key]);
        }
      });
      setLoadingData(false);
      setOptions(Array.from(uniqueValues));
    };
    
  };

  const handleCheckBoxChange = (event) => {
    const option = event.target.value;
    if (event.target.checked) {
      setSelectedOptions(prevSelectedOptions => [...prevSelectedOptions, option]);
    } else {
      setSelectedOptions(prevSelectedOptions => prevSelectedOptions.filter(item => item !== option));
    };
  };

  const handleOnClickFilterButton = (key) => {
    if ( selectedOptions.length > 0 ) {
      const filteredData = firstData.filter(row => {
        if (row.hasOwnProperty(key)) {
          return selectedOptions.includes(row[key]);
        }
        return true;
      });

      setFilterData(filteredData);
    } else {
      setFilterData(firstData);
    }
    toggleOpen();
  };

  const handleSearchOption = (e) => {
    setSearchTerm(e.target.value);
  }
  

  useEffect(()=> {
    getUniqueValuesByKey(data, name);
  }, []);

  return (
    <>
      <div style={{cursor: "pointer"}} onClick={()=>{toggleOpen(name)}} className='w-auto d-flex justify-content-center align-items-center gap-2'>
        <p>{name}</p>
        <MDBIcon fas icon={
          isOrderBy && orderType === null ? "sort" :
          isOrderBy && orderType === "asc" ? "sort-up" :
          isOrderBy && orderType === "desc" ? "sort-down" :
          !isOrderBy ? "filter" : ""
        } size='xs' color='white' className='mb-3' />
      </div>
      
      <MDBModal show={basicModal} setShow={setBasicModal}  tabIndex='-1' staticBackdrop>
        <MDBModalDialog scrollable>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle className='text-black'>{name}</MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={toggleOpen}></MDBBtn>
            </MDBModalHeader>
            
            <MDBModalBody>
              <h5 className='text-primary'>Seleccionar elementos</h5>
              <MDBInput
                name='searchInput'
                onChange={handleSearchOption}
                label="Buscar ..."
                className='mt-4 mb-4'
              />

              {loadingData ? (
                <ClipLoader />
              ) : (
                options.filter(opt => {
                  if (typeof opt === 'string') {
                    return opt.toLowerCase().includes(searchTerm.toLowerCase());
                  }
                  return false;
                }).map((opt, index) => (
                  <div key={index} className="form-check w-autoform-check w-auto d-flex justify-content-start align-items-start gap-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={opt}
                      onChange={handleCheckBoxChange}
                      checked={selectedOptions.includes(opt)}
                      value={opt}
                    />
                    <label className="form-check-label text-black" htmlFor={opt}>{opt}</label>
                  </div>
                ))
              )}
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn onClick={()=>{handleOnClickFilterButton(name)}}>Filtrar</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
}

export default DropdownFilters;
