import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedClient = localStorage.getItem('activeClient');
    const token = localStorage.getItem('token');
    
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedClient) setActiveClient(JSON.parse(savedClient));
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setLoading(false);
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/clients`);
      setClients(res.data.clients);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      
      setCurrentUser(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      if (data.user.clientId) localStorage.setItem('clientId', data.user.clientId);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      if (data.user.role === 'admin') {
         await fetchClients();
      } else {
         setActiveClient(data.user);
         localStorage.setItem('activeClient', JSON.stringify(data.user));
      }

      return { success: true, role: data.user.role };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid Credentials' };
    }
  };

  const addClient = async (clientData) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/client`, clientData);
      if (res.data.success) {
        await fetchClients();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      console.error('Failed to add client:', err);
      return { success: false, message: err.response?.data?.message || 'Failed to add client' };
    }
  };

  const deleteClient = async (clientId) => {
    try {
      const res = await axios.delete(`${API_URL}/api/auth/client/${clientId}`);
      if (res.data.success) {
        await fetchClients();
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      console.error('Failed to delete client:', err);
      return { success: false, message: err.response?.data?.message || 'Failed to delete client' };
    }
  };

  const toggleClientStatus = async (clientId) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/toggle-status`, { clientId });
      setClients(prev => prev.map(c => c._id === clientId ? { ...c, isActive: res.data.isActive } : c));
    } catch(err) {
      console.error('Failed to toggle client status:', err);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveClient(null);
    setClients([]);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeClient');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const selectClient = (client) => {
    setActiveClient(client);
    localStorage.setItem('activeClient', JSON.stringify(client));
  };

  const deactivateClient = () => {
    setActiveClient(null);
    localStorage.removeItem('activeClient');
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, activeClient, clients, fetchClients, addClient, deleteClient,
      login, logout, selectClient, deactivateClient, toggleClientStatus, loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
