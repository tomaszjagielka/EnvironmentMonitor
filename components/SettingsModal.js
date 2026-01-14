import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

const SettingsModal = ({ visible, onClose, onSave, initialValues }) => {
    const [maxTemp, setMaxTemp] = useState('');
    const [minTemp, setMinTemp] = useState('');
    const [maxHum, setMaxHum] = useState('');
    const [minHum, setMinHum] = useState('');

    useEffect(() => {
        if (visible && initialValues) {
            setMaxTemp(initialValues.maxTemp.toString());
            setMinTemp(initialValues.minTemp.toString());
            setMaxHum(initialValues.maxHum.toString());
            setMinHum(initialValues.minHum.toString());
        }
    }, [visible, initialValues]);

    const handleSave = () => {
        const maxT = parseFloat(maxTemp);
        const minT = parseFloat(minTemp);
        const maxH = parseFloat(maxHum);
        const minH = parseFloat(minHum);

        if (isNaN(maxT) || isNaN(minT) || isNaN(maxH) || isNaN(minH)) {
            Alert.alert("Invalid Input", "Please enter valid numbers for all fields.");
            return;
        }

        if (maxT <= minT) {
            Alert.alert("Invalid Temperature", "Max Temp must be greater than Min Temp.");
            return;
        }

        if (maxH <= minH) {
            Alert.alert("Invalid Humidity", "Max Humidity must be greater than Min Humidity.");
            return;
        }

        onSave({
            maxTemp: maxT,
            minTemp: minT,
            maxHum: maxH,
            minHum: minH
        });
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    <ScrollView>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Comfort settings</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={styles.closeButton}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>Temperature (°C)</Text>
                        <View style={styles.inputRow}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Max (Too hot)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={maxTemp}
                                    onChangeText={setMaxTemp}
                                    placeholder="26"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Min (Too cold)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={minTemp}
                                    onChangeText={setMinTemp}
                                    placeholder="18"
                                />
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Humidity (%)</Text>
                        <View style={styles.inputRow}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Max (Too humid)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={maxHum}
                                    onChangeText={setMaxHum}
                                    placeholder="65"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Min (Too dry)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={minHum}
                                    onChangeText={setMinHum}
                                    placeholder="30"
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Save settings</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%'
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
        fontSize: 20,
        fontWeight: '700',
        color: '#000'
    },
    closeButton: {
        color: '#007AFF',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 10,
        color: '#555'
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    inputGroup: {
        width: '48%'
    },
    label: {
        fontSize: 12,
        color: '#8e8e93',
        marginBottom: 5,
        textTransform: 'uppercase'
    },
    input: {
        backgroundColor: '#f2f2f7',
        padding: 12,
        borderRadius: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e5e5ea'
    },
    saveButton: {
        backgroundColor: '#34C759',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700'
    }
});

export default SettingsModal;
