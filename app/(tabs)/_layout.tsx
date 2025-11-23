import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="web">
        <Icon sf="safari.fill" drawable="ic_menu_view" />
        <Label>Web</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="courses">
        <Icon sf="book.fill" drawable="ic_menu_my_calendar" />
        <Label>Courses</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
