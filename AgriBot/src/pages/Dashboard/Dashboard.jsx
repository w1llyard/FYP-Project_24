import React, { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import { Skeleton } from "primereact/skeleton";
import styles from "./dashboard.module.css";
import WeatherCard from "../../components/WeatherCard/WeatherCard";
import useWeatherForecast from "../../hooks/useWeatherForecast";
import { db, collection, getDocs } from "../../firebase/firebase"; // Firestore imports
import {
  extractDatePart,
  fahrenheitToCelsius,
  inchToMm,
} from "../../utils/utilsFunction";

const Dashboard = () => {
  const { forecast, error, reload } = useWeatherForecast();
  const [monthlyData, setMonthlyData] = useState({
    fullyRipened: [],
    green: [],
    halfRipened: [],
    defective: [],
  }); // State to hold monthly harvest data

 // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  useEffect(() => {
    // Fetch data from Firestore
    const fetchHarvestData = async () => {
      try {
        const reportsCollection = collection(db, "RobotDailyReports");
        const querySnapshot = await getDocs(reportsCollection);
        const fullyRipened = {};
        const green = {};
        const halfRipened = {};
        const defective = {};
        const months = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const reportDate = doc.id;
          const month = new Date(reportDate).toLocaleString("default", {
            month: "long",
          });

          if (!months.includes(month)) {
            months.push(month);
            fullyRipened[month] = 0;
            green[month] = 0;
            halfRipened[month] = 0;
            defective[month] = 0;
          }

          fullyRipened[month] += data.fully_ripened || 0;
          green[month] += data.green || 0;
          halfRipened[month] += data.half_ripened || 0;
          defective[month] += data.bad || 0;
        });

        const fullyRipenedArr = months.map((month) => fullyRipened[month]);
        const greenArr = months.map((month) => green[month]);
        const halfRipenedArr = months.map((month) => halfRipened[month]);
        const defectiveArr = months.map((month) => defective[month]);

        setMonthlyData({
          fullyRipened: fullyRipenedArr,
          green: greenArr,
          halfRipened: halfRipenedArr,
          defective: defectiveArr,
          months,
        });
      } catch (error) {
        console.error("Error fetching data from Firestore: ", error);
      }
    };

    fetchHarvestData();
  }, []);

  const relevantForecast =
    forecast && forecast.length > 0
      ? forecast[0].Date.split("T")[0] === today
        ? forecast[0]
        : forecast[1]
      : null;

  // Line chart data for monthly tomato harvest percentages
  const lineChartData = {
    labels: monthlyData.months,
    datasets: [
      {
        label: "Total Fully Ripened Tomatoes",
        backgroundColor: "#FF6384",
        borderColor: "#FF6384",
        data: monthlyData.fullyRipened, // Data from Firestore
      },
      {
        label: "Total Defective Tomatoes",
        backgroundColor: "#000000",
        borderColor: "#000000",
        data: monthlyData.defective, // Data from Firestore
      },
      {
        label: "Total Green Tomatoes",
        backgroundColor: "#4BC0C0",
        borderColor: "#4BC0C0",
        data: monthlyData.green, // Data from Firestore
      },
      {
        label: "Total Half Ripened Tomatoes",
        backgroundColor: "#FFCE56",
        borderColor: "#FFCE56",
        data: monthlyData.halfRipened, // Data from Firestore
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    aspectRatio: 1,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const documentStyle = getComputedStyle(document.documentElement);

  const chartData = {
    labels: ["Fully Ripened", "Green", "Half Ripened", "Defects"],
    datasets: [
      {
        data: monthlyData
          ? [
              monthlyData.fullyRipened.slice(-1)[0],
              monthlyData.green.slice(-1)[0],
              monthlyData.halfRipened.slice(-1)[0],
              monthlyData.defective.slice(-1)[0],
            ]
          : [0, 0, 0, 0], // Default values if no data is available
        backgroundColor: [
          documentStyle.getPropertyValue("--red-500"),
          documentStyle.getPropertyValue("--green-500"),
          documentStyle.getPropertyValue("--yellow-500"),
          documentStyle.getPropertyValue("--black-500"),
        ],
        hoverBackgroundColor: [
          documentStyle.getPropertyValue("--red-600"),
          documentStyle.getPropertyValue("--green-600"),
          documentStyle.getPropertyValue("--yellow-600"),
          documentStyle.getPropertyValue("--black-600"),
        ],
      },
    ],
  };

  const chartOptions = {
    cutout: "60%",
  };
  return (
    <div className={styles.dashboard}>
      <div className={styles.cards}>
        {relevantForecast ? (
          <>
            <WeatherCard
              icon="Temperature"
              title="Temperature (°C)"
              value={
                fahrenheitToCelsius(
                  (relevantForecast.Temperature.Maximum.Value +
                    relevantForecast.Temperature.Minimum.Value) / 2
                ) + " °C"
              }
              date={extractDatePart(relevantForecast.Date)}
            />
            <WeatherCard
              icon="Rainfall"
              title="Rainfall (mm)"
              value={inchToMm(relevantForecast.Day.Rain.Value) + " mm"}
              date={extractDatePart(relevantForecast.Date)}
            />
            <WeatherCard
              icon="Wind"
              title="Wind Speed (km/h)"
              value={
                (relevantForecast.Day.Wind.Speed.Value * 1.6).toFixed(2) +
                " km/h"
              }
              date={extractDatePart(relevantForecast.Date)}
            />
            <WeatherCard
              icon="Sun"
              title="Hours (h)"
              value={relevantForecast.HoursOfSun + " h"}
              date={extractDatePart(relevantForecast.Date)}
            />
          </>
        ) : (
          <>
            {Array(4)
              .fill(0)
              .map((data, index) => (
                <Skeleton
                  key={index}
                  width="290px"
                  height="140px"
                  borderRadius="16px"
                ></Skeleton>
              ))}
          </>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap:"20px" }}>
        <div className={styles.chart}>
          <Chart
            type="doughnut"
            data={chartData}
            options={chartOptions}
            style={{ width: "30rem" }}
          />
        </div>
        <div className={styles.chart}>
          <Chart type="line" data={lineChartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
