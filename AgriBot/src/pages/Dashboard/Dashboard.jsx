import React from "react";
import { Chart } from "primereact/chart";
import { Skeleton } from "primereact/skeleton";
import styles from "./dashboard.module.css";
import CustomCard from "../../components/CustomCard/CustomCard";
import WeatherCard from "../../components/WeatherCard/WeatherCard";
import useWeatherForecast from "../../hooks/useWeatherForecast";
import {
  extractDatePart,
  fahrenheitToCelsius,
  inchToMm,
} from "../../utils/utilsFunction";

const Dashboard = () => {
  const { forecast, error, reload } = useWeatherForecast();
  const currentStatus = "Harvesting";

  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const relevantForecast = forecast && forecast.length > 0 ? 
    (forecast[0].Date.split('T')[0] === today ? forecast[0] : forecast[1]) : null;
    console.log(forecast,new Date().toISOString())

  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Total tomatoes harvest % per month",
        backgroundColor: "#42A5F5",
        borderColor: "#1E88E5",
        data: [65, 59, 80, 81, 56, 55, 40],
      },
      {
        label: "Total Defective tomatoes found % per month",
        backgroundColor: "#FF6384",
        borderColor: "#FF6384",
        data: [28, 48, 40, 19, 86, 27, 90],
      },
      {
        label: "Total Green tomatoes found %",
        backgroundColor: "#4BC0C0",
        borderColor: "#4BC0C0",
        data: [12, 19, 3, 5, 2, 3, 12],
      },
      {
        label: "Total half ripe tomatoes found %",
        backgroundColor: "#FFCE56",
        borderColor: "#FFCE56",
        data: [7, 11, 5, 8, 3, 7, 10],
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
                    relevantForecast.Temperature.Minimum.Value) /
                    2
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
                (relevantForecast.Day.Wind.Speed.Value * 1.6).toFixed(2) + " km/h"
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
      <div className={styles.cards}>
        <CustomCard
          title="Total tomatoes harvest"
          value="1.6k"
          percentage={-16}
          icon={<i className="pi pi-thumbs-up"></i>}
        />
        <CustomCard
          title="Total half ripe tomatoes found"
          value="1.6k"
          percentage={-16}
          icon={<i className="pi pi-thumbs-up"></i>}
        />
        <CustomCard
          title="Total Green tomatoes found"
          value="1.6k"
          percentage={-16}
          icon={<i className="pi pi-thumbs-up"></i>}
        />
        <CustomCard
          title="Total Defective tomatoes found"
          value="1.6k"
          percentage={-16}
          icon={<i className="pi pi-thumbs-up"></i>}
        />
      </div>
      <div className={styles.chart}>
        <Chart type="bar" data={data} options={options} />
      </div>
    </div>
  );
};

export default Dashboard;
