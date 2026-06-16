import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { COLOR_BG, COLOR_PRIMARY } from '@/constants/design';

export default function EntryScreen() {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('onboarded').then(val => {
      setOnboarded(!!val);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLOR_BG }}>
        <ActivityIndicator color={COLOR_PRIMARY} size="large" />
      </View>
    );
  }

  return <Redirect href={onboarded ? '/home' : '/onboarding'} />;
}
