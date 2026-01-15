import { INFLUX_URL, ORG_ID, BUCKET } from '../constants/config';

export async function fetchSensorData(token) {
    const query = `
      from(bucket: "${BUCKET}")
        |> range(start: -24h)
        |> filter(fn: (r) => r["_measurement"] == "environment")
        |> filter(fn: (r) => r["_field"] == "temperature" or r["_field"] == "humidity")
        |> aggregateWindow(every: 30m, fn: mean, createEmpty: false)
        |> yield(name: "mean")
      `;

    // Only proceed if token is provided
    if (!token) {
        throw new Error("No InfluxDB Token provided. Please check Settings.");
    }

    const response = await fetch(`${INFLUX_URL}/api/v2/query?orgID=${ORG_ID}`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/vnd.flux',
        },
        body: query,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${await response.text()}`);
    }

    const text = await response.text();
    return parseInfluxCSV(text);
}

function parseInfluxCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const sensorsMap = {};

    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(',result,table')) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) return [];

    const headers = lines[headerIndex].split(',').map(h => h.trim());
    const fieldIdx = headers.indexOf('_field');
    const valueIdx = headers.indexOf('_value');
    const sensorIdx = headers.indexOf('sensor_name');
    const timeIdx = headers.indexOf('_time');

    if (sensorIdx === -1 || fieldIdx === -1 || valueIdx === -1 || timeIdx === -1) return [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const parts = line.split(',');
        if (parts.length <= Math.max(sensorIdx, fieldIdx, valueIdx, timeIdx)) continue;

        const sensorId = parts[sensorIdx]?.trim();
        const field = parts[fieldIdx]?.trim();
        const valueRaw = parts[valueIdx]?.trim();
        const time = parts[timeIdx]?.trim();

        if (!sensorId || !field || !valueRaw || !time) continue;
        const value = parseFloat(valueRaw);

        if (!sensorsMap[sensorId]) {
            sensorsMap[sensorId] = { id: sensorId, history: { temperature: [], humidity: [] } };
        }

        if (field === 'temperature') {
            sensorsMap[sensorId].history.temperature.push({ time, value });
        } else if (field === 'humidity') {
            sensorsMap[sensorId].history.humidity.push({ time, value });
        }
    }

    Object.values(sensorsMap).forEach(sensor => {
        sensor.history.temperature.sort((a, b) => new Date(a.time) - new Date(b.time));
        sensor.history.humidity.sort((a, b) => new Date(a.time) - new Date(b.time));
    });

    return Object.values(sensorsMap);
}
