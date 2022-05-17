import '../styles/globals.scss';
import type { AppProps } from 'next/app';
import { UserProvider } from '@auth0/nextjs-auth0';
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs';
import { MyUserContextProvider } from '../utils/useUser';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
