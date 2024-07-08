import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primeicons/primeicons.css';



import router from "./routes";

function App() {

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router}/>
      </AuthProvider>
    </>
  )
}

export default App
