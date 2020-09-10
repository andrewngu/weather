import React, { useState } from "react";

const apiKey = '284027b5cfc736b902b27754a7064f44';

const geoUrl = ({ lat, long }) => `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}`;

const zipUrl = zipCode =>
  `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us&appid=${apiKey}`;

const kpis = [
  { label: "City", getter: weatherData => weatherData.name },
  { label: "Main", getter: weatherData => weatherData.weather.length ? weatherData.weather[0].main : null },
  {
    label: "Description",
    getter: weatherData => weatherData.weather.length ? weatherData.weather[0].description : null
  },
  { label: "Temperature", getter: weatherData => weatherData.main.temp },
];

const onClickHandler = ({ setLoading, setWeatherData, weatherData, zipCode }) => () => {
  if (weatherData[zipCode]) {
    return;
  }

  setLoading(true);
  fetch(zipUrl(zipCode))
    .then(result => result.json())
    .then(zipCodeData => {
      setWeatherData(prevState => ({ ...prevState, [zipCode]: zipCodeData }));
      setLoading(false);
    });
};

const onLocateHandler = ({ setLoading, setWeatherData, setZipCode, weatherData }) => () => {
  navigator.geolocation.getCurrentPosition(successData => {
    const url = geoUrl({ lat: successData.coords.latitude, long: successData.coords.longitude });

    setLoading(true);
    fetch(url)
      .then(result => result.json())
      .then(geoData => {
        setZipCode(0);
        setWeatherData(prevState => ({ ...prevState, 0: geoData }));
        setLoading(false);
      });
  });
};

const Root = () => {
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const [zipCode, setZipCode] = useState("");

  return (
    <div>
      <div>
        <input onChange={e => { setZipCode(e.currentTarget.value); }} type="text" value={zipCode} />
        <button onClick={onClickHandler({ setLoading, setWeatherData, weatherData, zipCode })} type="button">
          Submit
        </button>
        <button onClick={onLocateHandler({ setLoading, setWeatherData, setZipCode, weatherData })}>Detect my location</button>
      </div>
      {loading && <div>Loading</div>}
      {weatherData[zipCode] && (
        <div>
          {kpis.map(kpi => (
            <div>
              <div>{kpi.label}</div>
              <div>{kpi.getter(weatherData[zipCode])}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Root;
