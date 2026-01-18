import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { Alert } from 'react-native';

// Only the fields we care about from the API
type Contact = {
  id: number;
  name: string;
  email: string;
  phone: string;
  website?: string;
  company?: string;
  address?: string;
};

type ContactContextType = {
  contacts: Contact[];
  loading: boolean;
  addContact: (name: string, email: string, phone: string) => Promise<void>;
  deleteContact: (id: number) => Promise<void>;
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

      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map(mapUserToContact) : [];
      setContacts(normalized);
    } catch (error: any) {
      if (error?.name === 'AbortError') return; // ignore aborts
      const message = error?.message || 'Failed to fetch contacts';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchContacts(controller.signal);
    return () => controller.abort();
  }, []);

  // 2. CREATE: Fake add
  const addContact = async (name: string, email: string, phone: string) => {
    try {
      // API Call (Fake)
      const response = await fetch('https://jsonplaceholder.typicode.com/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone }),
        headers: { 'Content-type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Create failed: ${response.status}`);
      const created = await response.json();
      
      // Local State Update (Real UI change)
      const newContact: Contact = {
        id: created?.id ?? Date.now(),
        name,
        email,
        phone,
        website: created?.website,
        company: created?.company?.name,
        address: created?.address
          ? `${created.address.street}, ${created.address.city} ${created.address.zipcode}`
          : undefined,
      };
      setContacts((prev) => [newContact, ...prev]); 
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
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      const message = (error as Error)?.message || 'Could not delete contact';
      Alert.alert('Error', message);
    }
  };

  const value = useMemo(
    () => ({ contacts, loading, addContact, deleteContact }),
    [contacts, loading]
  );

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = (): ContactContextType => {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error('useContacts must be used within ContactProvider');
  return ctx;
};