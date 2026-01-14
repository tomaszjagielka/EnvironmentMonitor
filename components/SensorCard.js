import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getComfortStatus } from '../utils/comfort';
import { calculateStats } from '../utils/stats';
import { chartConfigTemp, chartConfigHum } from '../constants/theme';

const SensorCard = ({ item, onOpenHistory, thresholds }) => {
    const { width } = useWindowDimensions();
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0, type: null });

    const handleDataPointClick = (data, type) => {
        setTooltipPos({
            x: data.x,
            y: data.y,
            visible: true,
            value: data.value,
            dataset: data.dataset,
            index: data.index,
            type: type
        });
    };

    const handleChartPress = () => {
        if (tooltipPos.visible) setTooltipPos({ ...tooltipPos, visible: false });
    };

    const tempStats = calculateStats(item.history.temperature);
    const humStats = calculateStats(item.history.humidity);
    const latestTemp = item.history.temperature?.length > 0
        ? item.history.temperature[item.history.temperature.length - 1].value
        : null;
    const latestHum = item.history.humidity?.length > 0
        ? item.history.humidity[item.history.humidity.length - 1].value
        : null;
    const comfort = getComfortStatus(latestTemp, latestHum, thresholds);

    const getChartData = (field) => {
        const history = item.history[field] || [];
        const labels = history.map(d => {
            const date = new Date(d.time);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        });
        const data = history.map(d => d.value);
        const step = Math.max(1, Math.ceil(labels.length / 6));
        const filteredLabels = labels.map((label, index) => (index % step === 0 ? label : ""));

        return {
            labels: filteredLabels.length > 0 ? filteredLabels : ["Now"],
            datasets: [{ data: data.length > 0 ? data : [0] }]
        };
    };



    const chartWidth = width - 72;

    return (
        <View style={styles.card} onStartShouldSetResponder={() => true} onResponderRelease={handleChartPress}>
            <View style={styles.cardHeader}>
                <Text style={styles.sensorName}>Sensor {item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: comfort.color }]}>
                    <Text style={[styles.statusText, { color: comfort.text }]}>{comfort.label}</Text>
                </View>
            </View>

            <View style={styles.readingsContainer}>
                <View style={styles.readingItem}>
                    <Text style={styles.readingLabel}>Temp</Text>
                    <Text style={styles.readingValue}>{latestTemp !== null ? latestTemp.toFixed(1) : '--'}°C</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.readingItem}>
                    <Text style={styles.readingLabel}>Humidity</Text>
                    <Text style={styles.readingValue}>{latestHum !== null ? latestHum.toFixed(1) : '--'}%</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Avg temp</Text>
                    <Text style={styles.statValue}>{tempStats ? tempStats.avg : '--'}°C</Text>
                </View>
                <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Max temp</Text>
                    <Text style={styles.statValue}>{tempStats ? tempStats.max : '--'}°C</Text>
                </View>
                <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Avg hum</Text>
                    <Text style={styles.statValue}>{humStats ? humStats.avg : '--'}%</Text>
                </View>
            </View>

            <Text style={styles.chartTitle}>Temperature (24h)</Text>
            <LineChart
                data={getChartData('temperature')}
                width={chartWidth}
                height={180}
                yAxisSuffix="°C"
                chartConfig={chartConfigTemp}
                bezier
                onDataPointClick={(data) => handleDataPointClick(data, 'temp')}
                decorator={() => {
                    return tooltipPos.visible && tooltipPos.type === 'temp' ? (
                        <View>
                            <View style={[styles.tooltip, { left: tooltipPos.x - 15, top: tooltipPos.y - 35 }]}>
                                <Text style={styles.tooltipText}>{tooltipPos.value.toFixed(1)}</Text>
                            </View>
                        </View>
                    ) : null;
                }}
                style={styles.chart}
            />

            <Text style={styles.chartTitle}>Humidity (24h)</Text>
            <LineChart
                data={getChartData('humidity')}
                width={chartWidth}
                height={180}
                yAxisSuffix="%"
                chartConfig={chartConfigHum}
                bezier
                onDataPointClick={(data) => handleDataPointClick(data, 'hum')}
                decorator={() => {
                    return tooltipPos.visible && tooltipPos.type === 'hum' ? (
                        <View>
                            <View style={[styles.tooltip, { left: tooltipPos.x - 15, top: tooltipPos.y - 35 }]}>
                                <Text style={styles.tooltipText}>{tooltipPos.value.toFixed(0)}%</Text>
                            </View>
                        </View>
                    ) : null;
                }}
                style={styles.chart}
            />

            <TouchableOpacity style={styles.historyButton} onPress={() => onOpenHistory(item)}>
                <Text style={styles.historyButtonText}>View detailed log</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sensorName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1c1c1e',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    readingsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16
    },
    statCol: {
        alignItems: 'center'
    },
    statLabel: {
        fontSize: 10,
        color: '#8e8e93',
        textTransform: 'uppercase'
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333'
    },
    readingItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: '#e5e5ea',
        marginHorizontal: 10,
    },
    readingLabel: {
        fontSize: 14,
        color: '#8e8e93',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    readingValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 8,
        marginBottom: 4,
        marginLeft: 4
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    historyButton: {
        marginTop: 10,
        padding: 12,
        backgroundColor: '#f0f0f5',
        borderRadius: 12,
        alignItems: 'center'
    },
    historyButtonText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 14
    },
    tooltip: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 6,
        borderRadius: 4,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    },
    tooltipText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    }
});

export default SensorCard;
