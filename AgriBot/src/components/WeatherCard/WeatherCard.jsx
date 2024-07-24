import styles from "./WeatherCard.module.css";

const WeatherCard = ({ icon, title, value, date }) => {
  const temperature = ({ size }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-thermometer-sun hidden md:block items-center h-20 w-20 text-customblue"
    >
      <path d="M12 9a4 4 0 0 0-2 7.5"></path>
      <path d="M12 3v2"></path>
      <path d="m6.6 18.4-1.4 1.4"></path>
      <path d="M20 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
      <path d="M4 13H2"></path>
      <path d="M6.34 7.34 4.93 5.93"></path>
    </svg>
  );

  const rainfall = ({ size }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-cloud-rain-wind hidden md:block items-center h-20 w-20 text-customblue"
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
      <path d="m9.2 22 3-7"></path>
      <path d="m9 13-3 7"></path>
      <path d="m17 13-3 7"></path>
    </svg>
  );

  const wind = ({ size }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-wind hidden md:block items-center h-20 w-20 text-customblue"
    >
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path>
    </svg>
  );

  const sun = ({ size }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-sun hidden md:block items-center h-20 w-20 text-customblue"
    >
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  );

  return (
    <div className={styles.weatherCard}>
      <div className={styles.icon}>
        {icon == "Temperature"
          ? temperature(75)
          : icon == "Rainfall"
          ? rainfall(75)
          : icon == "Wind"
          ? wind(75)
          : icon == "Sun"
          ? sun(75)
          : ""}
      </div>
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <p style={{fontSize:"10px"}}>Generated on : {date}</p>
      </div>
    </div>
  );
};

export default WeatherCard;
