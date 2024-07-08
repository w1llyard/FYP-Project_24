import { Button } from "primereact/button";
import React from "react";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", flexDirection: "column",alignItems:"center",justifyContent:"center",height:"100vh" }}>
      <div
        style={{
          background:
            "radial-gradient(50% 109137.91% at 50% 50%, rgba(233, 30, 99, 0.1) 0%, rgba(254, 244, 247, 0) 100%)",
            width:"100%", textAlign:"center"
        }}
      >
        <span style={{backgroundColor:"white",fontSize:"24px"}}>404</span>
      </div>
      <h1>Page Not Found</h1>
      <p style={{ fontSize: "30px" }}>Sorry, we could not find the page.</p>
      <div>
        <Button
          label="Go back"
          icon="pi pi-arrow-left"
          text
          style={{ color: "var(--primary)" }}
          onClick={()=>navigate("/")}
        />
      </div>
    </div>
  );
};

export default PageNotFound;
