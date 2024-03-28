import RunModelsLogicContainer from "../components/admin/tools/runmodels/RunModelsLogic";

const RunModelsPage = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    
    const token = localStorage.getItem("userToken");
  
    return(
        <RunModelsLogicContainer apiUrl={apiUrl} token={token} />
    );
}

export default RunModelsPage;