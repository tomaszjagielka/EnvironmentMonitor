import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const HistoryModal = ({ visible, onClose, sensor }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>History log: Sensor {sensor?.id}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={sensor ? [...sensor.history.temperature].reverse() : []}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => {
                            const humItem = sensor.history.humidity.find(h => h.time === item.time);
                            return (
                                <View style={styles.logRow}>
                                    <Text style={styles.logTime}>{new Date(item.time).toLocaleString()}</Text>
                                    <View style={styles.logValues}>
                                        <Text style={styles.logTemp}>{item.value.toFixed(1)}°C</Text>
                                        <Text style={styles.logHum}>{humItem ? humItem.value.toFixed(1) : '-'}%</Text>
                                    </View>
                                </View>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        backgroundColor: 'white',
        height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 15
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700'
    },
    closeButton: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600'
    },
    logRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5'
    },
    logTime: {
        fontSize: 14,
        color: '#666',
        flex: 2
    },
    logValues: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-end',
        gap: 10
    },
    logTemp: {
        fontWeight: '600',
        color: '#FF6347'
    },
    logHum: {
        fontWeight: '600',
        color: '#007AFF'
    }
});

export default HistoryModal;
