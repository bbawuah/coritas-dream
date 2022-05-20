import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import { Provider } from 'react-supabase';
import { client } from '../utils/supabase';
import { AuthProvider } from '../context/authContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </Provider>
  );
}

export default MyApp;
