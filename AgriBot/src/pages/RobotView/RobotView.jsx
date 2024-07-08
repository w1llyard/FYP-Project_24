import React from 'react';
import styles from './RobotView.module.css';

const RobotView = () => {
  const handleControl = (command) => {
    console.log(`Command: ${command}`);
    // Add your control logic here
  };

  const videoUrl = "http://192.168.100.11:5000/video_feed";
  return (
    <div className={styles.videoContainer}>
      <img className={styles.video} src={videoUrl} />
      <div className={styles.controls}>
        <button className={styles.button} onClick={() => handleControl('play')}>Play</button>
        <button className={styles.button} onClick={() => handleControl('pause')}>Pause</button>
        <button className={styles.button} onClick={() => handleControl('stop')}>Stop</button>
      </div>
    </div>
  );
};

export default RobotView;
