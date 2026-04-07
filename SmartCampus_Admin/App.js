import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export default function App() {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterStudent = async () => {
    if (!name || !rollNumber || !email) {
      return Alert.alert('Validation Error', 'All fields are required.');
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "students"), {
        name,
        rollNumber,
        email,
        bioSignatureRequired: true,
        enrolledCourses: ["CS101", "MA201", "PH301"],
        createdAt: serverTimestamp(),
      });

      Alert.alert('Registration Successful', `Student Profile ID: ${docRef.id} generated.`);
      setName('');
      setRollNumber('');
      setEmail('');
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Failed to connect to Firebase Cloud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.headerContainer}>
          <Text style={styles.brand}>🎓 SmartCampus</Text>
          <Text style={styles.header}>Admin Dashboard</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Register New Student</Text>
            <View style={styles.blinker}></View>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alan Turing"
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Roll / Registration Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2026CS101"
            placeholderTextColor="#64748b"
            value={rollNumber}
            onChangeText={setRollNumber}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="student@college.edu"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegisterStudent} disabled={isSubmitting}>
            <Text style={styles.buttonText}>{isSubmitting ? 'Registering to Cloud...' : 'Create Secure Profile'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          Registering a student enables their profile on the Firebase Cloud. The student will map their hardware Biometric signature upon their first login in the Student App.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 80,
  },
  headerContainer: {
    width: '100%',
    marginBottom: 40,
  },
  brand: {
    color: '#0ea5e9',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  header: {
    fontSize: 32,
    color: '#f8fafc',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#1e293b',
    width: '100%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '600',
  },
  blinker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#475569',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 20,
    paddingHorizontal: 10,
  }
});
