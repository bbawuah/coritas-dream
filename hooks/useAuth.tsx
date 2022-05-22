import { useContext } from 'react';
import { AuthContext } from '../context/authContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw Error('useAuth must be used within AuthProvider');
  return context;
}
