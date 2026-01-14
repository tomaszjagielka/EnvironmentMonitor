export function getComfortStatus(temp, hum, thresholds) {
    const maxTemp = thresholds?.maxTemp ?? 26;
    const minTemp = thresholds?.minTemp ?? 18;
    const maxHum = thresholds?.maxHum ?? 65;
    const minHum = thresholds?.minHum ?? 30;

    if (temp == null || hum == null) return { label: 'Unknown', color: '#E0E0E0', text: '#757575' };
    if (temp > maxTemp) return { label: 'Too hot', color: '#FFCDD2', text: '#D32F2F' };
    if (temp < minTemp) return { label: 'Too cold', color: '#BBDEFB', text: '#1976D2' };
    if (hum > maxHum) return { label: 'Too humid', color: '#E1BEE7', text: '#7B1FA2' };
    if (hum < minHum) return { label: 'Too dry', color: '#FFE0B2', text: '#F57C00' };
    return { label: 'Comfortable', color: '#C8E6C9', text: '#388E3C' };
}
