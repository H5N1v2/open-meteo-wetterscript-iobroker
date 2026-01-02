// ##########################################################################
// #  WETTER-SKRIPT FÜR OPEN-METEO (ioBroker) v1.01 by H5N1                       #
// ##########################################################################


/// Hier Latitude und Longitude Setzten, suchbar auf https://open-meteo.com/en/docs
const latitude  = INSERT_YOUR_LATITUDE_HERE; 
const longitude = INSERT_YOUR_LONGITUDE_HERE; 
///////////////////////////////////////////////////////////////////////////////////
//// Ab hier nichts mehr Ändern \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const baseDP = "0_userdata.0.open-meteo-api";

const axios = require('axios'); 

const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,rain_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,wind_gusts_10m_max&timezone=Europe%2FBerlin&forecast_days=7`;
const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm10,pm2_5,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,ragweed_pollen&hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,ragweed_pollen&timezone=Europe%2FBerlin&forecast_days=7`;

const metaData = {
    "temperature_2m": { name: "Temperatur", unit: "°C" },
    "relative_humidity_2m": { name: "Luftfeuchtigkeit", unit: "%" },
    "apparent_temperature": { name: "Gefühlte Temperatur", unit: "°C" },
    "precipitation": { name: "Niederschlag", unit: "mm" },
    "cloud_cover": { name: "Bewölkung", unit: "%" },
    "wind_speed_10m": { name: "Windgeschwindigkeit", unit: "km/h" },
    "wind_direction_10m": { name: "Windrichtung", unit: "°" },
    "wind_gusts_10m": { name: "Windböen", unit: "km/h" },
    "weather_code": { name: "Wetter-Code", unit: "" },
    "temperature_2m_max": { name: "Max. Temperatur", unit: "°C" },
    "temperature_2m_min": { name: "Min. Temperatur", unit: "°C" },
    "sunrise": { name: "Sonnenaufgang", unit: "Uhr" },
    "sunset": { name: "Sonnenuntergang", unit: "Uhr" },
    "rain_sum": { name: "Regenmenge", unit: "mm" },
    "snowfall_sum": { name: "Schneemenge", unit: "cm" },
    "uv_index_max": { name: "UV-Index Max.", unit: "" },
    "precipitation_probability_max": { name: "Regenwahrscheinlichkeit", unit: "%" },
    "wind_speed_10m_max": { name: "Windgeschwindigkeit Max.", unit: "km/h" },
    "wind_direction_10m_dominant": { name: "Hauptwindrichtung", unit: "°" },
    "wind_gusts_10m_max": { name: "Windböen Max.", unit: "km/h" },
    "european_aqi": { name: "Luftqualitätsindex (EU)", unit: "" },
    "pm10": { name: "Feinstaub PM10", unit: "µg/m³" },
    "pm2_5": { name: "Feinstaub PM2.5", unit: "µg/m³" },
    "alder_pollen": { name: "Pollen: Erle", unit: "körner/m³" },
    "birch_pollen": { name: "Pollen: Birke", unit: "körner/m³" },
    "grass_pollen": { name: "Pollen: Gräser", unit: "körner/m³" },
    "mugwort_pollen": { name: "Pollen: Beifuß", unit: "körner/m³" },
    "ragweed_pollen": { name: "Pollen: Ambrosia", unit: "körner/m³" }
};

const weatherCodes = {
    0: "Klarer Himmel", 1: "Hauptsächlich klar", 2: "Teilweise bewölkt", 3: "Bedeckt",
    45: "Nebel", 48: "Raureifnebel", 51: "Leichter Nieselregen", 55: "Dichter Nieselregen",
    61: "Leichter Regen", 63: "Mäßiger Regen", 65: "Starker Regen", 71: "Leichter Schneefall",
    95: "Gewitter", 96: "Gewitter mit leichtem Hagel", 99: "Gewitter mit starkem Hagel"
};

function getWindDirText(deg) {
    if (deg >= 337.5 || deg < 22.5)  return "Norden";
    if (deg >= 22.5  && deg < 67.5)  return "Nordost";
    if (deg >= 67.5  && deg < 112.5) return "Osten";
    if (deg >= 112.5 && deg < 157.5) return "Südost";
    if (deg >= 157.5 && deg < 202.5) return "Süden";
    if (deg >= 202.5 && deg < 247.5) return "Südwest";
    if (deg >= 247.5 && deg < 292.5) return "Westen";
    if (deg >= 292.5 && deg < 337.5) return "Nordwest";
    return "Unbekannt";
}

function formatTime(isoString) {
    if (!isoString || typeof isoString !== "string") return isoString;
    const parts = isoString.split("T");
    return parts.length === 2 ? parts[1].substring(0, 5) : isoString;
}

async function fetchWeatherData() {
    console.log("Starte Abruf...");
    try {
        const responseWeather = await axios.get(url);
        if (responseWeather.data) await processData(responseWeather.data, "");

        const responseAir = await axios.get(airQualityUrl);
        if (responseAir.data) await processAirQualityData(responseAir.data);
        
        console.log("Alle Datenpunkte aktualisiert.");
    } catch (error) {
        console.error("Fehler: " + error.message);
    }
}

async function processData(data, subFolder) {
    const root = subFolder ? `${baseDP}.${subFolder}` : baseDP;

    if (data.current) {
        for (let key in data.current) {
            let val = data.current[key];
            let info = metaData[key] || { name: key, unit: "" };
            await setWeatherState(`${root}.Wetter_Aktuell.${key}`, val, info.name, info.unit);
            if (key === "weather_code") await setWeatherState(`${root}.Wetter_Aktuell.weather_text`, weatherCodes[val] || "Unbekannt", "Wetterzustand Text", "");
            if (key.includes("wind_direction")) await setWeatherState(`${root}.Wetter_Aktuell.wind_direction_text`, getWindDirText(val), "Windrichtung Text", "");
        }
    }

    if (data.daily) {
        for (let i = 0; i < data.daily.time.length; i++) {
            let dayFolder = `${root}.Wetter_Täglich.Tag_${i}`;
            for (let key in data.daily) {
                let val = data.daily[key][i];
                if (key === "sunrise" || key === "sunset") val = formatTime(val);
                let info = metaData[key] || { name: key, unit: "" };
                await setWeatherState(`${dayFolder}.${key}`, val, info.name, info.unit);
                if (key === "weather_code") await setWeatherState(`${dayFolder}.weather_text`, weatherCodes[val] || "Unbekannt", "Wetterzustand Text", "");
                if (key.includes("wind_direction")) await setWeatherState(`${dayFolder}.wind_direction_text`, getWindDirText(val), "Windrichtung Text", "");
            }
        }
    }
}

async function processAirQualityData(data) {
    const root = `${baseDP}.Luft_Qualität`;
    if (data.current) {
        for (let key in data.current) {
            await setWeatherState(`${root}.Luft_Pollen_Aktuell.${key}`, data.current[key], metaData[key]?.name || key, metaData[key]?.unit || "");
        }
    }
    if (data.hourly) {
        for (let day = 0; day < 7; day++) {
            let dayFolder = `${root}.Luft_Pollen_Täglich.Tag_${day}`;
            let startIdx = day * 24;
            let endIdx = startIdx + 24;
            for (let key in data.hourly) {
                if (key === "time") continue;
                let dailyValues = data.hourly[key].slice(startIdx, endIdx);
                let maxVal = Math.max(...dailyValues);
                await setWeatherState(`${dayFolder}.${key}`, maxVal, metaData[key]?.name || key, metaData[key]?.unit || "");
            }
        }
    }
}

async function setWeatherState(path, val, name, unit) {
    // 1. NULL-Werte abfangen
    if (val === null || val === undefined) {
        val = (unit === "" || unit === "Uhr") ? "" : 0;
    }

    // 2. Datenpunkt erstellen (mit Schreibberechtigung!)
    if (!(await existsStateAsync(path))) {
        await createStateAsync(path, { 
            name: name, 
            type: typeof val, 
            read: true, 
            write: true,
            role: "value",
            unit: unit 
        });
    }
    
    // 3. Wert setzen mit Bestätigung (true)
    await setStateAsync(path, val, true);
}
//// Abfrage intervall alle 15 min \\\\
schedule("2,17,32,47 * * * *", fetchWeatherData); //fragt 2 Minuten nach der Viertelstunde ab, um Stoßzeiten und Timeouts zu reduzieren. 
fetchWeatherData();