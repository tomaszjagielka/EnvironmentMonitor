import { Platform } from 'react-native';

export const chartConfigTemp = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#ffa726" },
    propsForLabels: { fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: 'bold' }
};

export const chartConfigHum = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForLabels: { fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: 'bold' }
};

export const COLORS = {
    background: '#F2F2F7',
    white: '#fff',
    border: '#e5e5ea',
    text: '#000',
    subText: '#8e8e93',
    primary: '#007AFF',
    error: '#d32f2f',
    errorBg: '#ffe5e5',
    success: '#34C759'
};
