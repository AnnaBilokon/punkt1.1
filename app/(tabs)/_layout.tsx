import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabConfig = {
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  name: string;
};

const TABS: TabConfig[] = [
  {
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
    label: 'Home',
    name: 'home',
  },
  {
    activeIcon: 'search',
    inactiveIcon: 'search-outline',
    label: 'Discover',
    name: 'discover',
  },
  {
    activeIcon: 'book',
    inactiveIcon: 'book-outline',
    label: 'Library',
    name: 'library',
  },
  {
    activeIcon: 'person-circle',
    inactiveIcon: 'person-circle-outline',
    label: 'Profile',
    name: 'profile',
  },
];

function CustomTabBar({ state }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 18 + insets.bottom,
        left: 16,
        right: 16,
        height: 64,
        backgroundColor: '#F9F9F9',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
      }}
    >
      {TABS.map((tab) => {
        const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
        const focused = state.index === routeIndex;

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(`/(tabs)/${tab.name}` as any)}
            style={{ flex: 1, alignItems: 'center' }}
          >
            <View
              style={{
                alignItems: 'center',
                borderRadius: 16,
                gap: 3,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: focused ? '#7851A926' : 'transparent',
              }}
            >
              <Ionicons
                color={focused ? '#7851A9' : '#9b9b9b'}
                name={focused ? tab.activeIcon : tab.inactiveIcon}
                size={22}
              />
              <Text
                style={{
                  color: focused ? '#7851A9' : '#9b9b9b',
                  fontSize: 11,
                  fontWeight: focused ? '600' : '400',
                }}
              >
                {tab.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#FDFDFD' },
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="friends" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
    </Tabs>
  );
}
