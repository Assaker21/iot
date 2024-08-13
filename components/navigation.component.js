import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
} from "@ui-kitten/components";

export default function Navigation({ navigation, state }) {
  return (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
    >
      <BottomNavigationTab
        title="DASHBOARD"
        icon={(props) => <Icon {...props} name="pie-chart-outline" />}
      />
      <BottomNavigationTab
        title="PREDICTIONS"
        icon={(props) => <Icon {...props} name="rewind-right-outline" />}
      />
      <BottomNavigationTab
        title="DEVICES"
        icon={(props) => <Icon {...props} name="monitor-outline" />}
      />
      <BottomNavigationTab
        title="SETTINGS"
        icon={(props) => <Icon {...props} name="settings-outline" />}
      />
    </BottomNavigation>
  );
}
