import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { Alert } from 'react-native';

// Only the fields we care about from the API
export type Contact = {
  id: number;
  name: string;
  email: string;
  phone: string;
  website?: string;
  company?: string;
  address?: string;
};

export type ContactContextType = {
  contacts: Contact[];
  loading: boolean;
  addContact: (contact: Omit<Contact, 'id'>) => Promise<void>;
  deleteContact: (id: number) => Promise<void>;
  updateContact: (id: number, updates: Partial<Contact>) => Promise<void>;
};

const ContactContext = createContext<ContactContextType | null>(null);

export const ContactProvider = ({ children }: { children: React.ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  // Normalize API payload into our Contact shape
  const mapUserToContact = (user: any): Contact => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    website: user.website,
    company: user.company?.name,
    address: user.address
      ? `${user.address.street}, ${user.address.city} ${user.address.zipcode}`
      : undefined,
  });

  // 1. READ: Fetch initial data
  const fetchContacts = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users', { signal });
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

      // waiting for jsonplaceholder to return data
      const data = await response.json();
      // normalize data
      const normalized = Array.isArray(data) ? data.map(mapUserToContact) : [];
      // update state
      setContacts(normalized);
      
    } catch (error: any) {
      if (error?.name === 'AbortError') return; // ignore aborts
      const message = error?.message || 'Failed to fetch contacts';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts on mount
  useEffect(() => {
    const controller = new AbortController();
    fetchContacts(controller.signal);
    return () => controller.abort();
  }, []);

  // 2. CREATE: Fake add
  const addContact = async (contact: Omit<Contact, 'id'>) => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users', {
        method: 'POST',
        body: JSON.stringify(contact),
        headers: { 'Content-type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Create failed: ${response.status}`);
      const created = await response.json(); // parses JSON response into native JavaScript objects

      const newContact: Contact = {
        id: created?.id ?? Date.now(),
        ...contact,
      };

      // console.log('Created contact:', newContact); // debugging log
      
      setContacts((prev) => [newContact, ...prev]); // adds a new contact to the top of the previous list
    } catch (error) {
      const message = (error as Error)?.message || 'Could not add contact';
      Alert.alert('Error', message);
    }
  };

  // 3. DELETE: Fake delete
  const deleteContact = async (id: number) => {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 200 && response.status !== 204) {
        throw new Error(`Delete failed: ${response.status}`);
      }
      setContacts((prev) => prev.filter((c) => c.id !== id)); // removes the deleted contact from the list
    } catch (error) {
      const message = (error as Error)?.message || 'Could not delete contact';
      Alert.alert('Error', message);
    }
  };

  // 4. UPDATE: Fake update
  const updateContact = async (id: number, updates: Partial<Contact>) => {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Update failed: ${response.status}`);

      setContacts((prev) =>
        prev.map((contact) => (contact.id === id ? { ...contact, ...updates } : contact))
      );
    } catch (error) {
      const message = (error as Error)?.message || 'Could not update contact';
      Alert.alert('Error', message);
    }
  };

  const value = useMemo(
    () => ({ contacts, loading, addContact, deleteContact, updateContact }),
    [contacts, loading]
  );

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
};

export const useContacts = (): ContactContextType => {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error('useContacts must be used within ContactProvider');
  return ctx;
};
