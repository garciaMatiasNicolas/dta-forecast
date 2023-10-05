import AppRouter from "./routes/Router";
import './App.css'
import { AppContextProvider } from "./context/Context";


const App = ()=>{
  return (
    <AppContextProvider>
      <AppRouter/>
    </AppContextProvider>
  );
}

export default App;
