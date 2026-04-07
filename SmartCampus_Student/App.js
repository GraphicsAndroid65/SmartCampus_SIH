import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export default function App() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [status, setStatus] = useState('Standby');

  // Check if hardware supports biometrics
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  }, []);

  const handleAttendanceCheckIn = async () => {
    try {
      const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
      if (!savedBiometrics) {
        return Alert.alert(
          'Biometric record not found',
          'Please ensure you have set up fingerprint/face ID on your device.',
          [{ text: 'OK' }]
        );
      }

      // Trigger Genuine Android Hardware Biometric Prompt
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify Presence (Anti-Proxy)',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true, // Only biometric, no pins
      });

      if (biometricAuth.success) {
        setStatus('Verified Locally. Syncing to Firebase...');

        // Log real attendance to Firebase
        await addDoc(collection(db, "attendance"), {
          studentId: "student_uuid_001", // This would be the auth user ID in production
          lectureId: "DATA_STRUCTURES_CS101",
          verifiedVia: "Hardware_Biometric",
          timestamp: serverTimestamp(),
          status: "Present"
        });

        setStatus('Attendance successfully marked and verified!');
        Alert.alert('Success', 'Biometric verified and attendance saved to cloud.');
      } else {
        setStatus('Biometric failed or cancelled.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Error connecting to Firebase.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SmartCampus Student</Text>
      <View style={styles.card}>
        <Text style={styles.lectureText}>Active Lecture: Data Structures</Text>
        <Text style={styles.timeText}>09:00 AM - 10:00 AM</Text>
        <Text style={[styles.statusText, {
          color: status.includes('success') ? '#10b981' : '#f59e0b'
        }]}>{status}</Text>
      </View>

      {isBiometricSupported ? (
        <TouchableOpacity style={styles.button} onPress={handleAttendanceCheckIn}>
          <Text style={styles.buttonText}>Tap Fingerprint to Check-in</Text>
        </TouchableOpacity>
      ) : (
        <Text style={{ color: '#ef4444' }}>Biometric sensor not detected on this device.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    color: '#4a90e2',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lectureText: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '600',
  },
  timeText: {
    color: '#94a3b8',
    marginTop: 5,
  },
  statusText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
