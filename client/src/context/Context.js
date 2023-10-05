import { createContext, useState } from "react";

const AppContext = createContext( [] );

const AppContextProvider = ( {children} )=> {
    
    const [dataGraphic, setDataGraphic] = useState(null);
    
    // EXPORT DE ESTADOS Y FUNCIONES DEL CONTEXTO
    const context = {
        dataGraphic,
        setDataGraphic
    }
    
    return(
        <AppContext.Provider value={context}>
            {children}
        </AppContext.Provider>
    )
}

export {AppContext, AppContextProvider}