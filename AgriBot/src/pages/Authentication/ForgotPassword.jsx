import React, { useState, useRef } from "react";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import styles from "./login.module.css";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

import { doPasswordReset } from "../../firebase/auth";
import { useAuth } from "../../contexts/AuthProvider";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  const toast = useRef(null);

  const resetPassword = async () => {
    setLoading(true);

    if (!validateEmail(email)) {
      handleError("Invalid Email");
      return;
    }

    try {
      await doPasswordReset(email).then(() => {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Email Sent",
          life: 2000,
        });
        setLoading(false);
      });
    } catch (error) {
      handleError(error.message);
      setLoading(false);
    }
  };
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };
  const handleError = (error) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: error,
      life: 2000,
    });
  };

  return (
    <div className={styles.background}>
      <div className={styles.card}>
        <img src="src\assets\Logo.svg" width={"100px"} alt="" />
        <h2>Welcome Back</h2>
        <span>Enter your Email to continue</span>
        <div className={styles.inputContainer}>
          <FloatLabel>
            <InputText
              id="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="Email">Email</label>
          </FloatLabel>
        </div>
        <Button
          label="Reset Password"
          icon="pi pi-user"
          style={{ background: "var(--primary)", marginTop: "20px" }}
          loading={loading}
          onClick={resetPassword}
        />
      </div>
      <Toast ref={toast} />
    </div>
  );
};

export default ForgotPassword;
