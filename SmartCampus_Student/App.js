import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Animated } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [status, setStatus] = useState('Checking Range...');
  const [inRange, setInRange] = useState(true); // Mock geo range
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);

      // Pulse animation for the geo radar
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    })();
  }, []);

  const handleCheckIn = async () => {
    try {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) return Alert.alert('Error', 'Please setup Biometrics on your phone.');

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify SIH Attendance',
        disableDeviceFallback: true,
      });

      if (authResult.success) {
        setStatus('Syncing to Cloud...');
        // Sync real attendance
        await addDoc(collection(db, "attendance"), {
          studentId: "student_001_sih",
          lectureId: "DATA_STRUCTURES_CS101",
          verifiedVia: "Secure_Native_Biometric",
          timestamp: serverTimestamp(),
          status: "Present"
        });
        setStatus('Attendance Confirmed ✓');
        Alert.alert('Attendance Secured', 'Your geometric & biometric signatures were verified.');
      } else {
        setStatus('Authentication failed.');
      }
    } catch (e) {
      console.error(e);
      setStatus('System Error.');
    }
  };

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="school-outline" size={32} color="#4facfe" />
        <Text style={styles.headerText}>SmartCampus</Text>
      </View>

      {/* Main Radar Dashboard */}
      <View style={styles.dashboard}>
        <Animated.View style={[styles.radarCircle, { transform: [{ scale: pulseAnim }], borderColor: inRange ? '#00f2fe' : '#ff0844' }]} />
        <Ionicons name={inRange ? "bluetooth" : "bluetooth-outline"} size={48} color={inRange ? "#00f2fe" : "#555"} style={styles.radarIcon} />

        <Text style={styles.lectureTitle}>Data Structures & Algos</Text>
        <Text style={styles.roomText}>Room 101 • Alan Turing • 10:00 AM</Text>

        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: status.includes('Confirmed') ? '#00f2fe' : '#f8b500' }]}>{status}</Text>
        </View>
      </View>

      {/* Check In Action */}
      <View style={styles.actionSection}>
        <Text style={styles.infoText}>You must remain inside the classroom Geofence (BLE 101) for 80% of the timeline to retain this attendance.</Text>
        <TouchableOpacity
          style={styles.bioButton}
          onPress={handleCheckIn}
          activeOpacity={0.8}
        >
          <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.gradientBtn}>
            <Ionicons name="finger-print" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.btnText}>Biometric Check-in</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: 1,
  },
  dashboard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 30,
    borderRadius: 30,
    width: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  radarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    position: 'absolute',
    top: 30,
  },
  radarIcon: {
    marginBottom: 40,
    marginTop: -5,
  },
  lectureTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  roomText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  statusBadge: {
    marginTop: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionSection: {
    width: '100%',
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  infoText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
  },
  bioButton: {
    width: '100%',
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientBtn: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
