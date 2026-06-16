import { Ionicons } from '@expo/vector-icons';
import { TabTrigger, TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  COLOR_BG,
  COLOR_PRIMARY,
  COLOR_TEXT_MUTED,
  RADIUS_CARD,
  SHADOW_LG,
  TAB_BAR_BOTTOM_INSET,
  TAB_BAR_HEIGHT,
} from '@/constants/design';

type Tab = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TABS: Tab[] = [
  { name: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'map', label: 'Map', icon: 'map-outline', iconActive: 'map' },
  { name: 'impact', label: 'Impact', icon: 'trophy-outline', iconActive: 'trophy' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

type TabButtonProps = TabTriggerSlotProps & {
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
};

const TabButton = forwardRef<View, TabButtonProps>(
  ({ isFocused, icon, iconActive, label, onPress, onLongPress, ...rest }, ref) => {
    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        {...rest}>
        <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
          <Ionicons
            name={isFocused ? iconActive : icon}
            size={22}
            color={isFocused ? COLOR_PRIMARY : COLOR_TEXT_MUTED}
          />
        </View>
        <Text style={[styles.label, isFocused && styles.labelActive]}>
          {label}
        </Text>
      </Pressable>
    );
  },
);

TabButton.displayName = 'TabButton';

export function FloatingTabBar() {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        {TABS.map(tab => (
          <TabTrigger key={tab.name} name={tab.name} asChild>
            <TabButton
              icon={tab.icon}
              iconActive={tab.iconActive}
              label={tab.label}
            />
          </TabTrigger>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: TAB_BAR_BOTTOM_INSET,
    left: 16,
    right: 16,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: Platform.select({
      ios: 'rgba(248,250,252,0.92)',
      default: COLOR_BG,
    }),
    borderRadius: RADIUS_CARD,
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    paddingHorizontal: 8,
    ...SHADOW_LG,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.8)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  iconWrap: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(17,94,89,0.10)',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: COLOR_TEXT_MUTED,
  },
  labelActive: {
    color: COLOR_PRIMARY,
    fontWeight: '700',
  },
});
