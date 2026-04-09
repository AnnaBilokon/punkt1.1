import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

const TAB_SCREEN_OPTIONS = {
  headerShown: false,
  sceneStyle: {
    backgroundColor: '#FDFDFD',
  },
  tabBarActiveBackgroundColor: '#CFCEF9',
  tabBarActiveTintColor: '#313C5D',
  tabBarInactiveTintColor: '#212121',
  tabBarShowLabel: false,
  tabBarStyle: {
    backgroundColor: '#F9F9F9',
    borderColor: '#D9D9D9',
    borderRadius: 999,
    borderTopWidth: 1,
    bottom: 18,
    height: 49,
    left: 20,
    paddingBottom: 5,
    paddingTop: 5,
    position: 'absolute' as const,
    right: 20,
  },
  tabBarItemStyle: {
    borderRadius: 999,
    marginHorizontal: 4,
  },
} as const;

const tabBarIcon =
  (name: keyof typeof Ionicons.glyphMap, title: string) =>
  ({ color, focused }: { color: string; size: number; focused: boolean }) => {
    if (focused) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons color={color} name={name} size={20} />
          <Text style={{ fontSize: 11, fontWeight: '400', color: '#313C5D' }}>{title}</Text>
        </View>
      );
    }
    return <Ionicons color={color} name={name} size={25} />;
  };

const LIBRARY_TAB_OPTIONS = {
  tabBarIcon: tabBarIcon('book-outline', 'Library'),
  title: 'Library',
};

const DISCOVER_TAB_OPTIONS = {
  tabBarIcon: tabBarIcon('search-outline', 'Discover'),
  title: 'Discover',
};

const FRIENDS_TAB_OPTIONS = {
  tabBarIcon: tabBarIcon('person-outline', 'Friends'),
  title: 'Friends',
};

const MESSAGES_TAB_OPTIONS = {
  tabBarIcon: tabBarIcon('mail-outline', 'Messages'),
  title: 'Messages',
};

const PROFILE_TAB_OPTIONS = {
  tabBarIcon: tabBarIcon('person-circle-outline', 'Profile'),
  title: 'Profile',
};

export default function TabsLayout() {
  return (
    <Tabs screenOptions={TAB_SCREEN_OPTIONS}>
      <Tabs.Screen name="library" options={LIBRARY_TAB_OPTIONS} />
      <Tabs.Screen name="discover" options={DISCOVER_TAB_OPTIONS} />
      <Tabs.Screen name="friends" options={FRIENDS_TAB_OPTIONS} />
      <Tabs.Screen name="messages" options={MESSAGES_TAB_OPTIONS} />
      <Tabs.Screen name="profile" options={PROFILE_TAB_OPTIONS} />
    </Tabs>
  );
}
