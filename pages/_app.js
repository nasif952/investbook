import { useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import Head from 'next/head';
import '../styles/globals.css';
import Header from '../components/Header';
import { getDesignTokens } from '../styles/theme';

// Create emotion cache for MUI styles
const createEmotionCache = () => {
  return createCache({ key: 'css', prepend: true });
};
const clientSideEmotionCache = createEmotionCache();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
  emotionCache = clientSideEmotionCache,
}) {
  const [mode, setMode] = useState('light');
  const [mounting, setMounting] = useState(true);
  
  // Load theme preference from localStorage when app loads
  useEffect(() => {
    // Check for saved preferences
    const savedMode = localStorage.getItem('theme');
    // Check for system preferences if no saved preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode) {
      setMode(savedMode);
    } else if (prefersDark) {
      setMode('dark');
    }
    
    setMounting(false);
  }, []);
  
  // Create theme based on mode
  const theme = createTheme(getDesignTokens(mode));
  
  // Avoid rendering content until after client-side hydration to prevent theme flicker
  if (mounting) {
    return null;
  }

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Incubator Platform</title>
        <meta name="description" content="Startup Incubator Platform for evaluating and supporting startups" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </ThemeProvider>
    </CacheProvider>
  );
} 