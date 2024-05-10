import { createContext, useState } from "react";

const AppContext = createContext( [] );

const AppContextProvider = ( {children} )=> {
    
    const [dataGraphic, setDataGraphic] = useState(null);
    const [forecastPage, setForecastPage] = useState(false);
    const [optionsFilterTable, setOptionsFilterTable] = useState([]);
    
    // EXPORT DE ESTADOS Y FUNCIONES DEL CONTEXTO
    const context = {
        dataGraphic,
        setDataGraphic,
        forecastPage, 
        setForecastPage,
        optionsFilterTable,
        setOptionsFilterTable
    }
    
    return(
        <AppContext.Provider value={context}>
            {children}
        </AppContext.Provider>
    )
}

export {AppContext, AppContextProvider}