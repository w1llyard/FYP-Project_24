import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase"; // Adjust the path as needed
import styles from "./RobotView.module.css";

const RobotView = () => {
  const [isAutoMode, setIsAutoMode] = useState(true); // Default to auto mode, disable movement buttons initially
  const [robotStatus, setRobotStatus] = useState("Offline"); // Default to offline
  const [robotMode, setRobotMode] = useState("Auto Mode"); // Robot mode status (Auto or Manual)
  const [robotIp, setRobotIp] = useState(""); // Robot IP address

  const fetchIpAddresses = async () => {
    try {
      const docRef = doc(db, "Settings", "IP Address");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { robot, computer } = docSnap.data();
        setRobotIp(robot);
      } else {
        console.log("No such document in Firebase!");
      }
    } catch (error) {
      console.error("Error fetching IP addresses:", error);
    }
  };

  useEffect(() => {
    fetchIpAddresses(); // Fetch IP addresses when component mounts
  }, []);

  const videoUrl = `http://${robotIp}:8080/?action=stream`;


  // Function to fetch robot status
  const fetchStatus = async () => {
    try {
      const statusUrl = `http://${robotIp}:5000/status`;
      const response = await fetch(statusUrl);
      const result = await response.json();
      if (response.ok) {
        setRobotStatus("Online");
        setIsAutoMode(result.status === "auto");
        setRobotMode(result.status === "auto" ? "Auto Mode" : "Manual Mode");
      } else {
        console.error(`Error: ${result.error}`);
        setRobotStatus("Offline");
        setRobotMode("Auto Mode");
      }
    } catch (error) {
      console.error("Network error while fetching status:", error);
      setRobotStatus("Offline");
      setRobotMode("Auto Mode");
    }
  };

  // Fetch status and check video feed every 5 seconds
  useEffect(() => {
    if (robotIp) {
      fetchStatus(); // Initial fetch for robot status
      const interval = setInterval(() => {
        fetchStatus();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [robotIp]);

  const handleControl = async (command) => {
    console.log(`Command: ${command}`);
    try {
      const controlUrl = `http://${robotIp}:5000/control`;
      const response = await fetch(controlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      });

      const result = await response.json();
      if (response.ok) {
        if (command === "manual") {
          setIsAutoMode(false);
          setRobotMode("Manual Mode");
        }
        if (command === "auto") {
          setIsAutoMode(true);
          setRobotMode("Auto Mode");
        }
      } else {
        console.error(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <div className={styles.videoContainer}>
      <div className={styles.statusContainer}>
        <p
          className={`${styles.statusText} ${
            robotStatus === "Online"
              ? styles.statusOnline
              : styles.statusOffline
          }`}
        >
          Robot Status: {robotStatus}
        </p>
        <p className={styles.statusText}>Robot Mode: {robotMode}</p>
      </div>

      <img className={styles.video} src={videoUrl} />

      <div className={styles.controls}>
        <Button
          label="Auto Mode"
          className="p-button-primary"
          onClick={() => handleControl("auto")}
        />
        <Button
          label="Manual Mode"
          className="p-button-primary"
          onClick={() => handleControl("manual")}
        />
        <Button
          label="Move Forward"
          className="p-button-success"
          onClick={() => handleControl("forward")}
          disabled={isAutoMode} // Disable when in auto mode
        />
        <Button
          label="Move Left"
          className="p-button-info"
          onClick={() => handleControl("left")}
          disabled={isAutoMode} // Disable when in auto mode
        />
        <Button
          label="Move Right"
          className="p-button-info"
          onClick={() => handleControl("right")}
          disabled={isAutoMode} // Disable when in auto mode
        />
        <Button
          label="Move Backward"
          className="p-button-info"
          onClick={() => handleControl("back")}
          disabled={isAutoMode} // Disable when in auto mode
        />
      </div>
    </div>
  );
};

export default RobotView;
