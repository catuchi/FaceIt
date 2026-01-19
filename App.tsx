/**
 * FaceIt App
 * Main application entry point
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
