import { createContext, useState } from "react";

const AppContext = createContext( [] );

const AppContextProvider = ( {children} )=> {
    
    const [tool, setTool] = useState("");
    
    // EXPORT DE ESTADOS Y FUNCIONES DEL CONTEXTO
    const context = {
        tool,
        setTool
    }
    
    return(
        <AppContext.Provider value={context}>
            {children}
        </AppContext.Provider>
    )
}

export {AppContext, AppContextProvider}