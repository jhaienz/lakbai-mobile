import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { StyleSheet, View } from 'react-native';

import { FloatingTabBar } from '@/components/FloatingTabBar';

export default function TabLayout() {
  return (
    <Tabs style={styles.container}>
      <TabSlot style={styles.slot} />
      <TabList style={styles.hiddenList}>
        <TabTrigger name="home" href="/home" />
        <TabTrigger name="map" href="/map" />
        <TabTrigger name="impact" href="/impact" />
        <TabTrigger name="profile" href="/profile" />
      </TabList>
      <FloatingTabBar />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slot: { flex: 1 },
  hiddenList: { display: 'none' },
});
