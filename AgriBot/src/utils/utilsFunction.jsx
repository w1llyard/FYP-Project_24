export const extractDatePart = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const fahrenheitToCelsius = (fahrenheit) => {
  return (((fahrenheit - 32) * 5) / 9).toFixed(2);
};

export const inchToMm = (inch) => {
    return (inch * 25.4).toFixed(2);
}