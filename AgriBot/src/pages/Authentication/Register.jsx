import React, { useState, useRef } from "react";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import styles from "./login.module.css";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";

import {
  doCreateUserWithEmailAndPassword,
  updateUserProfile,
} from "../../firebase/auth";
import { useAuth } from "../../contexts/AuthProvider";

const Register = () => {
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [isRegistering, setIsRegistering] = useState(false);

  if (auth.userLoggedIn) {
    window.location.href = "/";
    return;
  }

  const toast = useRef(null);

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    if (!validateEmail(email)) {
      handleError("Email is incorrect.");
      setIsRegistering(false);
      return;
    }
    if (password !== confirmPassword) {
      handleError("Passwords not the same");
      setIsRegistering(false);
      return;
    }
    if (password.trim().length < 5) {
      handleError("Password should be at least 6 characters");
      setIsRegistering(false);
      return;
    }

    try {
      await doCreateUserWithEmailAndPassword(email, password).then(() => {
        setIsRegistering(false);
        updateUserProfile(displayName);
        window.location.href = "/";
      });
    } catch (error) {
      handleError(error.message);
      setIsRegistering(false);
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
        <span>Enter your credentials to continue</span>
        <div className={styles.inputContainer}>
          <FloatLabel>
            <InputText
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <label htmlFor="Name">Full Name</label>
          </FloatLabel>
        </div>
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
        <div className={styles.inputContainer}>
          <FloatLabel>
            <Password
              inputId="password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
            />
            <label htmlFor="password">Password</label>
          </FloatLabel>
        </div>
        <div className={styles.inputContainer} style={{ marginBottom: "20px" }}>
          <FloatLabel>
            <InputText
              id="confirmP"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label htmlFor="confirmP">Confirm Password</label>
          </FloatLabel>
        </div>

        <Button
          label="Register"
          icon="pi pi-user"
          style={{ background: "var(--primary)" }}
          loading={isRegistering}
          onClick={handleEmailRegister}
        />
        <Divider>
          <b>Or</b>
        </Divider>
        <a
          href="/Login"
          style={{ alignSelf: "center", color: "black", margin: "0px" }}
        >
          Have an Account?
        </a>
      </div>
      <Toast ref={toast} />
    </div>
  );
};

export default Register;
