import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, RefreshControl, StatusBar, Platform, TouchableOpacity, Alert, Modal } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal';
import SensorCard from './components/SensorCard';
import { fetchSensorData } from './services/influx';
import { REFRESH_INTERVAL } from './constants/config';

export default function App() {
  const [sensors, setSensors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [thresholds, setThresholds] = useState({
    maxTemp: 26,
    minTemp: 18,
    maxHum: 65,
    minHum: 30
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('sensor_dashboard_thresholds');
        if (jsonValue != null) {
          setThresholds(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (newThresholds) => {
    try {
      const jsonValue = JSON.stringify(newThresholds);
      await AsyncStorage.setItem('sensor_dashboard_thresholds', jsonValue);
      setThresholds(newThresholds);
    } catch (e) {
      console.error("Failed to save settings", e);
      Alert.alert("Error", "Failed to save settings");
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const parsedData = await fetchSensorData();
      setSensors(parsedData);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
      setError(`Error: ${e.message}\nCheck log for details.`);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);


  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  const onExport = async () => {
    try {
      if (sensors.length === 0) {
        Alert.alert("No Data", "Nothing to export yet.");
        return;
      }

      let csv = 'Timestamp,Sensor,Type,Value\n';
      sensors.forEach(sensor => {
        sensor.history.temperature.forEach(pt => {
          csv += `${pt.time},${sensor.id},Temperature,${pt.value}\n`;
        });
        sensor.history.humidity.forEach(pt => {
          csv += `${pt.time},${sensor.id},Humidity,${pt.value}\n`;
        });
      });

      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'sensors_data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return;
      }

      const path = FileSystem.documentDirectory + 'sensors_data.csv';
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType ? FileSystem.EncodingType.UTF8 : 'utf8' });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Export Failed", err.message);
    }
  };

  const openHistory = (sensor) => {
    setSelectedSensor(sensor);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => {
    return <SensorCard item={item} onOpenHistory={openHistory} thresholds={thresholds} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Environment history</Text>
          {lastUpdated && <Text style={styles.subTitle}>Auto-updates (30s): {lastUpdated.toLocaleTimeString()}</Text>}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.settingsButton}>
            <Text style={styles.settingsText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onExport} style={styles.exportButton}>
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={sensors}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
        }
        ListEmptyComponent={
          !error && <Text style={styles.emptyText}>Loading sensors...</Text>
        }
      />

      <HistoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        sensor={selectedSensor}
      />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onSave={saveSettings}
        initialValues={thresholds}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  subTitle: {
    fontSize: 12,
    color: '#8e8e93',
  },
  exportButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  exportText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  settingsButton: {
    padding: 8,
  },
  settingsText: {
    fontSize: 20
  },
  listContent: {
    padding: 16,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffe5e5',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#8e8e93',
    fontSize: 16,
  }
});
