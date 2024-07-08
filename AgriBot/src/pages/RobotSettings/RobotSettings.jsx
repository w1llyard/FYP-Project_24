import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from "./RobotSettings.module.css";
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase'; // Adjust the path as needed

const RobotSettings = () => {
  const [harvestingRate, setHarvestingRate] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [userLocation, setUserLocation] = useState([-20.2582305, 57.7544636]); // Default location

  const harvestingRates = [
    { label: 'Once a Week', value: 'week' },
    { label: 'Each 2 Weeks', value: '2 week' },
    { label: 'Once a Month', value: 'month' },
    { label: 'Each 3 Months', value: '3 months' },
    { label: 'Each 6 Months', value: '6 months' }
  ];
  
  useEffect(() => {
    // Fetch user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
      });
    }

    // Fetch existing settings
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'Settings', 'config'); // Correct document reference
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setHarvestingRate(data.harvestRate);
          setWaypoints(data.waypoints.map(point => ({ lat: point.latitude, lng: point.longitude })));
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
      }
    };

    fetchSettings();
  }, []);



  const handleSave = async () => {
    try {
      const formattedWaypoints = waypoints.map(point => ({
        latitude: point.lat,
        longitude: point.lng
      }));
      await setDoc(doc(db, 'Settings', 'config'), {
        harvestRate: harvestingRate,
        waypoints: formattedWaypoints
      });
      console.log('Data saved successfully');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setWaypoints([...waypoints, e.latlng]);
      },
      contextmenu(e) { // Handle right-click event
        const { lat, lng } = e.latlng;
        const closestIndex = waypoints.reduce((closestIdx, point, idx) => {
          const distance = Math.sqrt((point.lat - lat) ** 2 + (point.lng - lng) ** 2);
          const closestDistance = Math.sqrt((waypoints[closestIdx].lat - lat) ** 2 + (waypoints[closestIdx].lng - lng) ** 2);
          return distance < closestDistance ? idx : closestIdx;
        }, 0);

        const updatedWaypoints = [...waypoints];
        updatedWaypoints.splice(closestIndex, 1);
        setWaypoints(updatedWaypoints);
      }
    });
    return null;
  };

  // Add the first waypoint at the end to close the loop if there are more than 2 waypoints
  const polylinePositions = waypoints.length > 2 ? [...waypoints, waypoints[0]] : waypoints;

  return (
    <div className={styles.settings}>

      <div className={styles.fields}>
        <label htmlFor="harvestingRate">Harvesting Rate</label>
        <Dropdown
          id="harvestingRate"
          value={harvestingRate}
          options={harvestingRates}
          onChange={(e) => setHarvestingRate(e.value)}
          placeholder="Select a Harvesting Rate"
        />
      </div>

      <div className={styles.fields}>
        <label htmlFor="map">Add Waypoints</label>
        <MapContainer center={userLocation} zoom={50} style={{ height: '600px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents />
          {waypoints.map((waypoint, index) => (
            <Marker key={index} position={waypoint}></Marker>
          ))}
          <Polyline positions={polylinePositions} />
        </MapContainer>
      </div>

      <div className={styles.fields}>
        <Button label="Save" icon="pi pi-check" onClick={handleSave} />
      </div>
    </div>
  );
};

export default RobotSettings;
