import { Session, User } from '@supabase/supabase-js';
import { createContext, useEffect, useState } from 'react';
import { useAuthStateChange, useClient } from 'react-supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
}

const initialState: AuthState = { session: null, user: null };
export const AuthContext = createContext(initialState);

export const AuthProvider: React.FC = ({ children }) => {
  const client = useClient();
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const session = client.auth.session();
    setState({ session, user: session?.user ?? null });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAuthStateChange((event, session) => {
    console.log(`${event} from context`);
    setState({ session, user: session?.user ?? null });
  });

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};
