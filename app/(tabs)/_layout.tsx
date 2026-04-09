import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

const tabBarIcon =
  (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) => (
    <Ionicons color={color} name={name} size={size} />
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: '#F5F7FC',
        },
        tabBarActiveTintColor: '#6E56CF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: 84,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: tabBarIcon('library-outline'),
          title: 'Library',
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: tabBarIcon('compass-outline'),
          title: 'Discover',
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{ tabBarIcon: tabBarIcon('people-outline'), title: 'Friends' }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: tabBarIcon('chatbubble-ellipses-outline'),
          title: 'Messages',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: tabBarIcon('person-circle-outline'),
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
