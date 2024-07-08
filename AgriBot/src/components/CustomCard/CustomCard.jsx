import React from "react";
import styles from "./customCard.module.css";

const CustomCard = ({ title, value, percentage, icon }) => {
  return (
    <div className={styles.card}>
      <div className={styles.details}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value}</span>
        <span
          className={styles.percentage}
          style={{ color: percentage < 0 ? "red" : "green" }}
        >
          {percentage < 0 ? `↓ ${Math.abs(percentage)}%` : `↑ ${percentage}%`}{" "}
          Since last month
        </span>
      </div>
      <div className={styles.iconContainer}>{icon}</div>
    </div>
  );
};

export default CustomCard;
