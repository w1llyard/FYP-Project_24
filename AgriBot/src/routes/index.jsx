
import { createBrowserRouter } from "react-router-dom";
import Register from "../pages/Authentication/Register";
import ForgotPassword from "../pages/Authentication/ForgotPassword";
import PageNotFound from "../pages/Errors/PageNotFound";
import Login from "../pages/Authentication/Login";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard/Dashboard";
import Scheduler from "../pages/Scheduler/Scheduler";
import RobotView from "../pages/RobotView/RobotView";
import RobotSettings from "../pages/RobotSettings/RobotSettings";
import Analytics from "../pages/Analytics/Analytics";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [ // Adding children routes
      {
        path: "/", 
        element: <Dashboard/>
      },
      {
        path: "/Scheduler", 
        element: <Scheduler/>
      },
      {
        path: "/Robot", 
        element: <RobotView/>
      },
      {
        path: "/Analytics", 
        element: <Analytics/>
      },
      {
        path: "/Settings", 
        element: <RobotSettings/>
      },
    ]
  },
  {
    path: "/Login",
    element: <Login />,
  },
  {
    path: "/Register",
    element: <Register />,
  },
  {
    path: "/ForgotPassword",
    element: <ForgotPassword />,
  },
  {
    path: "*",
    element: <PageNotFound />, // This handles any undefined routes
  },
]);

export default router;
