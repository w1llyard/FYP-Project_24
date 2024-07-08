import React from "react";
import { useAuth } from "../contexts/AuthProvider";
import SideBar from "../components/SideBar/SideBar";
import NavBar from "../components/NavBar/NavBar";
import { Outlet } from "react-router-dom";

const Home = () => {
  const auth = useAuth();

  if (!auth.userLoggedIn) {
    window.location.href = "/Login";
    return;
  }

  return (
    <>
      <div style={{ display:"flex", flexDirection:"column",height: "100vh", width: "100vw" }}>
        <NavBar />
        <div style={{ display: "flex", height: "calc(100% - 80px)", paddingRight:"24px"}}>
          <SideBar />
          <div style={{height:"100%", width:"100%", borderRadius:"10px", backgroundColor:"var(--secondary)", padding:"24px 44px", overflow:"auto" }}>
            <Outlet />
          </div>
        </div>
      </div>
    </>
    // <div>

    //   <h1>You are at home :)</h1>
    //   <button
    //     onClick={() => {
    //       window.location.href = "/authenticate";
    //     }}
    //   >
    //     login
    //   </button>

    //   <button
    //     onClick={() => {
    //       doSignOut().then(() => {
    //         window.location.href = "/";
    //       });
    //     }}
    //   >
    //     logout
    //   </button>

    //   <hr />

    //   <p>logged in: {auth.userLoggedIn ? "yes" : "no"}</p>
    //   <p>
    //     logged in with: {auth.currentUser ? auth.currentUser.email : "no user"}
    //   </p>
    // </div>
  );
};

export default Home;
