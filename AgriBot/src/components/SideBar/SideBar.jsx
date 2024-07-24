import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./sidebar.module.css";

const sidebarItems = [
  { name: "home", icon: "pi pi-home", route: "/" },
  { name: "robot", icon: "pi pi-android", route: "/robot" },
  { name: "calendar", icon: "pi pi-calendar", route: "/scheduler" },
  { name: "settings", icon: "pi pi-cog", route: "/settings" },
];

const SideBar = () => {
  const [selectedIcon, setSelectedIcon] = useState("home");
  const navigate = useNavigate();
  const location = useLocation();

  // Function to handle icon click and navigate to the corresponding route
  const handleIconClick = (iconName, route) => {
    setSelectedIcon(iconName);
    navigate(route);
  };

  // Use effect to update selectedIcon based on the current route
  useEffect(() => {
    const path = location.pathname;
    const currentItem = sidebarItems.find(item => path.includes(item.route));
    if (currentItem) {
      setSelectedIcon(currentItem.name);
    }
  }, []);

  return (
    <div className={styles.sidebar}>
      {sidebarItems.map(item => (
        <div
          key={item.name}
          onClick={() => handleIconClick(item.name, item.route)}
          className={selectedIcon === item.name ? styles.selected : ""}
        >
          <i className={item.icon}></i>
        </div>
      ))}
    </div>
  );
};

export default SideBar;
