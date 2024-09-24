import React, { useState, useRef } from "react";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import styles from "./login.module.css";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";

import {
  doSignInWithGoogle,
  doSignInWithEmailAndPassword,
} from "../../firebase/auth";
import { useAuth } from "../../contexts/AuthProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");

  const auth = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (auth.userLoggedIn) {
    window.location.href = "/";
  }

  const toast = useRef(null);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      await doSignInWithEmailAndPassword(email, password).then(() => {
        setIsSigningIn(false);
        window.location.href = "/";
      });
    } catch (error) {
      handleError(error);
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await doSignInWithGoogle().then(() => {
        setIsSigningIn(false);
        window.location.href = "/";
      });
    } catch (error) {
      handleError(error);
      setIsSigningIn(false);
    }
  };

  const handleError = (error) => {
    var message = "";
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/invalid-email"
    ) {
      message = "Invalid email or password";
    } else if (error.code === "auth/email-already-in-use") {
      message = "Email already in use";
    } else if (error.code === "auth/popup-closed-by-user") {
      message = "Popup was closed by user";
    } else {
      message = error.message;
    }
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: message,
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
        <a href="ForgotPassword">Forgot Password</a>
        <Button
          label="Login"
          icon="pi pi-user"
          style={{ background: "var(--primary)" }}
          loading={isSigningIn}
          onClick={handleEmailLogin}
        />
        <Divider>
          <b>Or</b>
        </Divider>
        <Button
          icon="pi pi-google"
          label="Sign In With Google"
          outlined
          onClick={handleGoogleSignIn}
          loading={isSigningIn}
        />
        <a href="/Register" style={{ alignSelf: "center", color: "black" }}>
          Don't Have An Account?
        </a>
      </div>
      <Toast ref={toast} />
    </div>
  );
};

export default Login;
