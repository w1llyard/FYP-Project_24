import React, { useRef, useState } from "react";
import { Menu } from "primereact/menu";
import { Avatar } from "primereact/avatar";
import styles from "./navbar.module.css";
import { useAuth } from "../../contexts/AuthProvider";
import { doSignOut } from "../../firebase/auth";
const NavBar = () => {
  const auth = useAuth();
  const menu = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const items = [
    {
      label: "Settings",
      icon: "pi pi-fw pi-cog",
      command: () => {
        console.log("Settings clicked");
      },
    },
    {
      separator: true,
    },
    {
      label: "Logout",
      icon: "pi pi-fw pi-power-off",
      command: ()=>{
        doSignOut().then(() => {
            window.location.href = "/";
          });
      },
    },
  ];

  const toggleMenu = (event) => {
    menu.current.toggle(event);
    setMenuVisible(!menuVisible);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoSection}>
        <img src="src/assets/Logo.svg" alt="Logo" className={styles.logo} />
      </div>
      <div className={styles.profileSection} onClick={toggleMenu}>
        <Avatar
          image={auth.currentUser.photoURL} 
          size="large"
          shape="circle"
          style={{
            backgroundColor: "var(--primary_light)",
            color: "var(--primary)",
          }}
        />
        <div className={styles.username}>Hi {auth.currentUser.displayName}</div>
        <i className={"pi pi-chevron-down " + styles.icon}></i>
      </div>
      <Menu model={items} popup ref={menu} id="popup_menu" />
    </nav>
  );
};

export default NavBar;
