import { COLORS, spacingY } from "@/src/constants/theme";
import { isIOS } from "@/src/utils/safe-data-utils";
import { verticalScale } from "@/src/utils/styling";
import { Tabs } from "expo-router";
import * as Icons from "phosphor-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Props = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const CustomTabBar = ({ state, descriptors, navigation }: Props) => {
  const tabBarIcons: any = {
    index: (isFocused: boolean) => (
      <Icons.HouseIcon
        size={verticalScale(30)}
        weight={isFocused ? "fill" : "regular"}
        color={isFocused ? COLORS.primary : COLORS.neutral400}
      />
    ),

    statistics: (isFocused: boolean) => (
      <Icons.ChartBarIcon
        size={verticalScale(30)}
        weight={isFocused ? "fill" : "regular"}
        color={isFocused ? COLORS.primary : COLORS.neutral400}
      />
    ),

    wallet: (isFocused: boolean) => (
      <Icons.WalletIcon
        size={verticalScale(30)}
        weight={isFocused ? "fill" : "regular"}
        color={isFocused ? COLORS.primary : COLORS.neutral400}
      />
    ),

    profile: (isFocused: boolean) => (
      <Icons.UserIcon
        size={verticalScale(30)}
        weight={isFocused ? "fill" : "regular"}
        color={isFocused ? COLORS.primary : COLORS.neutral400}
      />
    ),
  };
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label: string | any =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItem}
          >
            {tabBarIcons[route.name] && tabBarIcons[route.name](isFocused)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    height: isIOS() ? verticalScale(73) : verticalScale(55),
    backgroundColor: COLORS.neutral800,
    justifyContent: "space-around",
    alignItems: "center",
    borderTopColor: COLORS.neutral700,
    borderTopWidth: 1,
  },
  tabBarItem: {
    marginBottom: isIOS() ? spacingY._10 : spacingY._5,
    justifyContent: "center",
    alignItems: "center",
  },
});
