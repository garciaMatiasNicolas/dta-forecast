import { MDBCheckbox, MDBCol, MDBContainer, MDBInput, MDBRow, MDBBtn, MDBIcon,  MDBModal, MDBModalDialog, MDBModalContent, MDBModalBody, MDBRadio} from "mdb-react-ui-kit";
import ToolsNav from "../../../navs/ToolsNav";
import ScenariosHistory from "./ScenariosHistory";
import convertData from '../../../../functions/stringFormat';
import { ClipLoader } from "react-spinners";
import { exogModels, machineLearningModels, timeSeriesModels } from "../../../../data/models";
import ParamsArima from "./ParamsArima";
import ParamsProphet from "./ParamsProphet";

const RunModelsVisual = (props) => {
    
    const {
        fileTypes,
        basicModal,
        setBasicModal,
        scenarios,
        lastScenarioRan,
        formRef,
        handleSubmit,
        areParamsSetted,
        handleCheckboxChange,
        handleInputChange,
        handleSelectChange,
        isFormValid,
        handleOptChange,
        isSelected,
        isExpert,
        setExpertModel,
        detectOutliers,
        setExplosiveVariable
    } = props

    return (
        <main style={{"minHeight": "100vh"}} className="bg-white pt-5 pb-5">
            <ToolsNav/>
            <ScenariosHistory scenarioList={scenarios}/>
            <h2 style={{"color": "black"}} className='mb-2 ms-5'>Seleccion de modelos de corrida</h2>
            <MDBContainer className="mt-2 ms-4">
                <MDBRow>
                    <MDBCol size='12'>
                        <form ref={formRef} className='p-5 border rounded' onSubmit={handleSubmit}>
                            <MDBContainer>
                                <MDBRow>
                                    <MDBCol size='lg'>
                                        <p className="text-primary">Escenario default</p>
                                        <MDBCheckbox 
                                            name="expertModel"
                                            value="expertModel"
                                            label="Modelo experto"
                                            onChange={setExpertModel}
                                        />

                                        <p className="text-primary mt-5">Modelos Series Temporales</p>
                                        {timeSeriesModels.map(item => (
                                            <MDBCheckbox 
                                                name='modelSelection' 
                                                value={item.value} 
                                                id={item.value} 
                                                label={item.label}  
                                                onChange={() => handleCheckboxChange(item.value, item.param)}
                                                disabled={isExpert}
                                            />
                                        ))}
    
                                        <p className="text-primary mt-5">Modelos Variables Exógenas</p>
                                        {exogModels.map(item => (
                                            <MDBCheckbox 
                                                name='modelSelection' 
                                                value={item.value} 
                                                id={item.value} 
                                                label={item.label}  
                                                onChange={() => handleCheckboxChange(item.value)}
                                                disabled={isExpert}
                                            />
                                        ))}
    
                                        <p className="mt-5 text-primary">Modelos Machine Learning</p>
                                        {machineLearningModels.map(item => (
                                            <MDBCheckbox 
                                                name='modelSelection' 
                                                value={item.value} 
                                                id={item.value} 
                                                label={item.label} 
                                                onChange={() => handleCheckboxChange(item.value)}
                                                disabled={isExpert}
                                            />
                                        ))}
    
                                        <p className="mt-5 text-primary">Otros modelos</p>
                                        <MDBCheckbox 
                                            name='modelSelection' 
                                            value='prophet' id='prophet' 
                                            label='Prophet' 
                                            onChange={() => handleCheckboxChange('prophet', 'prophet')} 
                                            disabled={isExpert}
                                        />
                                        <ParamsProphet isModelSelected={isSelected} lastScenariosParams={lastScenarioRan} areParamsSetted={areParamsSetted}/>
                                    </MDBCol>
    
                                    <MDBCol size='lg' className="d-flex justify-content-start align-items-center flex-column gap-3">
                                        <MDBInput label="Nombre de escenario" type="text" name="scenario_name" onChange={handleInputChange}/>
                                        <MDBInput label="Periodos sin entrenamiento de modelo" name="test_p" type="number" onChange={handleInputChange} disabled={isExpert} />
                                        <MDBInput label="Periodos de forecast" name="pred_p" type="number" onChange={handleInputChange} disabled={isExpert} />
                                        <MDBInput label="Periodos para calculo de error (recomendado 0 = todos)" name="error_p" type="number" onChange={handleInputChange} disabled={isExpert} />
                                        <select onChange={handleSelectChange} className="form-select" aria-label="Seleccionar archivo para la corrida">
                                            <option selected>Selecciona tipo de archivo</option>
                                            {fileTypes.map((fileType) => (
                                                <option value={fileType.id}>{convertData(fileType.model_type, true)}</option>
                                            ))}
                                        </select>
                                        <div className="w-100 mt-4">
                                            <p className="text-primary">¿Reemplazar predicciones negativas por 0?</p>
                                            <MDBRadio name='flexRadioDefault' id='replaceNegatives' label='Si' inline/>
                                            <MDBRadio name='flexRadioDefault' id='notReplaceNegatives' label='No' defaultChecked inline/>
                                        </div>
                                        <div className="w-100 mt-4">
                                            <p className="text-primary">Tipo de error a utilizar</p>
                                            <MDBRadio name='error' id='MAPE' label='MAPE' inline defaultChecked onChange={handleOptChange}/>
                                            <MDBRadio name='error' id='SMAPE' label='SMAPE'  inline 
                                            onChange={handleOptChange}/>
                                            <MDBRadio name='error' id='RMSE' label='RMSE'  inline
                                            onChange={handleOptChange}/>
                                            <MDBRadio name='error' id='MAE' label='MAE'  inline
                                            onChange={handleOptChange}/>
                                        </div>
                                        <div className="w-100 mt-4 mb-4">
                                            <p className="text-primary">Detectar valores atipicos</p>
                                            <MDBRadio  onChange={detectOutliers} name='outliers' id='yes' label='Si' inline defaultChecked />
                                            <MDBRadio onChange={detectOutliers} name='outliers' id='no' label='No'  inline />
                                        </div>
                                        <select style={{maxWidth: "280px", alignSelf: "start"}} onChange={setExplosiveVariable} className="form-select" aria-label="Seleccionar archivo para la corrida">
                                            <option selected>Porcentaje variable explosiva</option>
                                            <option value={0}>0%</option>
                                            <option value={2.5}>25%</option>
                                            <option value={5}>50%</option>
                                            <option value={7.5}>75%</option>
                                        </select>
                                        <ParamsArima isModelSelected={isSelected} lastScenariosParams={lastScenarioRan} setAdditionalParams={areParamsSetted}/>
                                       {/*  <ParamsHolts isModelSelected={isSelected} areParamsSetted={areParamsSetted}/> */}
                                    </MDBCol>
                                </MDBRow>
                            </MDBContainer>
                            
                            <MDBRow className="mt-4">
                                <MDBBtn
                                    type="submit" 
                                    className="w-auto d-flex justify-content-center align-items-center gap-2 ms-3" 
                                    color="primary" 
                                    disabled={!isFormValid()}
                                >
                                    <MDBIcon fas icon="forward" color="white"/>
                                    <span>Forecast</span>
                                </MDBBtn>
                            </MDBRow>
                        </form>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
            
            <MDBModal staticBackdrop tabIndex="-1" show={basicModal} setShow={setBasicModal}>
                <MDBModalDialog>
                <MDBModalContent>
                    <MDBModalBody>
                    <div className="d-flex justify-content-center align-items-center flex-column gap-2">
                        <ClipLoader color="#2b9eb3" size={50} /> 
                        <h5 >Corriendo modelos...</h5>
                    </div>
                    </MDBModalBody>
                </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
           
        </main>
    )
}

export default RunModelsVisual

