import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { COLOR_BG, COLOR_PRIMARY } from '@/constants/design';
import type { UserRole } from '@/types';

export default function EntryScreen() {
  useEffect(() => {
    (async () => {
      const [roleRaw, onboardedRaw] = await AsyncStorage.multiGet(['userRole', 'onboarded']);
      const role = roleRaw[1] as UserRole | null;
      const onboarded = !!onboardedRaw[1];

      if (!role) {
        router.replace('/login');
      } else if (role === 'tourist') {
        router.replace(onboarded ? '/home' : '/onboarding');
      } else if (role === 'business') {
        router.replace('/business' as never);
      } else {
        router.replace('/lgu' as never);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLOR_BG }}>
      <ActivityIndicator color={COLOR_PRIMARY} size="large" />
    </View>
  );
}
