import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useContacts } from '../../context/ContactContext';
import { Ionicons } from '@expo/vector-icons';

export default function ContactDetails() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>(); // dynamic route param
  const router = useRouter();
  const { contacts, deleteContact } = useContacts();

  // Find the specific contact from our Context state
  const contactId = Array.isArray(id) ? id[0] : id;
  const contact = contacts.find((c) => c.id.toString() === contactId);

  const infoItems = useMemo(
    () =>
      contact
        ? [
            { key: 'email', icon: 'mail', label: 'Email', value: contact.email },
            { key: 'phone', icon: 'call', label: 'Phone', value: contact.phone },
            { key: 'website', icon: 'globe', label: 'Website', value: contact.website || 'N/A' },
            { key: 'address', icon: 'location', label: 'Address', value: contact.address || 'N/A' },
          ]
        : [],
    [contact]
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            if (contact?.id) {
              await deleteContact(contact.id);
              router.back(); // Go back to list after delete
            }
          }
        }
      ]
    );
  };

  if (!contact) {
    return (
      <View style={styles.center}>
        <Text>Contact not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: contact.name }} />

      <FlatList
        style={styles.container}
        data={infoItems}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <InfoRow icon={item.icon} label={item.label} value={item.value} />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarTextLarge}>{contact.name[0]}</Text>
            </View>
            <Text style={styles.name}>{contact.name}</Text>
            <Text style={styles.company}>{contact.company || 'No Company'}</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() =>
                router.push({ pathname: '/add-contact', params: { editId: contact.id.toString() } })
              }
            >
              <Ionicons name="pencil" size={20} color="white" />
              <Text style={styles.buttonText}>Edit Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.buttonText}>Delete Contact</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </>
  );
}

// Helper component for rows to keep code clean
const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <View style={styles.section}>
    <View style={styles.row}>
      <Ionicons name={icon} size={24} color="#007AFF" style={styles.icon} />
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 30, backgroundColor: 'white', marginBottom: 10 },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  avatarTextLarge: { fontSize: 32, color: 'white', fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold' },
  company: { fontSize: 16, color: '#666', marginTop: 4 },
  section: { backgroundColor: 'white', padding: 20, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 20, width: 30, textAlign: 'center' },
  label: { fontSize: 12, color: '#888', marginBottom: 2 },
  value: { fontSize: 16, color: '#000' },
  actionContainer: { padding: 20 },
  button: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    padding: 15, borderRadius: 10, marginBottom: 15
  },
  editButton: { backgroundColor: '#007AFF' },
  deleteButton: { backgroundColor: '#FF3B30' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});