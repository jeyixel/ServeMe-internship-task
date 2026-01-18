import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useContacts } from '../context/ContactContext';

export default function AddContact() {
  const { editId } = useLocalSearchParams<{ editId?: string | string[] }>();
  const router = useRouter();
  const contactId = Array.isArray(editId) ? editId[0] : editId;

  const { contacts, addContact, updateContact, loading } = useContacts();

  const existingContact = useMemo(
    () => contacts.find((c) => c.id.toString() === contactId),
    [contacts, contactId]
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingContact) {
      setName(existingContact.name ?? '');
      setEmail(existingContact.email ?? '');
      setPhone(existingContact.phone ?? '');
      setWebsite(existingContact.website ?? '');
      setCompany(existingContact.company ?? '');
      setAddress(existingContact.address ?? '');
    }
  }, [existingContact]);

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert('Missing info', 'Name, email, and phone are required.');
      return;
    }

    setSaving(true);
    try {
      if (existingContact) {
        await updateContact(existingContact.id, { name, email, phone, website, company, address });
      } else {
        await addContact(name, email, phone);
      }
      router.back();
    } catch (error) {
      const message = (error as Error)?.message || 'Could not save contact';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <Stack.Screen options={{ title: existingContact ? 'Edit Contact' : 'Add Contact' }} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Jane Doe"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="jane@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="555-123-4567"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Website (optional)
        </Text>
        <TextInput
          style={styles.input}
          value={website}
          onChangeText={setWebsite}
          placeholder="example.com"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Company (optional)</Text>
        <TextInput
          style={styles.input}
          value={company}
          onChangeText={setCompany}
          placeholder="Acme Inc"
        />

        <Text style={styles.label}>Address (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={address}
          onChangeText={setAddress}
          placeholder="123 Main St, City"
          multiline
        />

        <TouchableOpacity
          style={[styles.button, saving || loading ? styles.buttonDisabled : null]}
          onPress={handleSave}
          disabled={saving || loading}
        >
          <Text style={styles.buttonText}>
            {existingContact ? 'Save Changes' : 'Add Contact'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, gap: 12 },
  label: { fontSize: 14, color: '#555' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
