import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator, 
  StatusBar 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useContacts } from './context/ContactContext'; // Ensure this path matches your folder structure
import { Ionicons } from '@expo/vector-icons';

export default function ContactListScreen() {
  const router = useRouter();
  const { contacts, loading } = useContacts();
  const [search, setSearch] = useState('');

  // Filter contacts based on search input
  const filteredContacts = contacts.filter((c) => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/contact/${item.id}`)} // Navigate to Details Page
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Contacts" }} />
      <StatusBar barStyle="dark-content" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }} // Space for FAB
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No contacts found</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (Add Contact) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/add-contact')} // Navigate to Add Form
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 50
  },
  searchContainer: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    margin: 16, 
    padding: 12, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2 
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 16, 
    marginHorizontal: 16, 
    marginBottom: 12, 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2 
  },
  avatar: { 
    width: 46, 
    height: 46, 
    borderRadius: 23, 
    backgroundColor: '#007AFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  phone: { fontSize: 14, color: '#666', marginTop: 2 },
  emptyText: { color: '#999', fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6
  }
});