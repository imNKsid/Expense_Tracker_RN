import { StatusBar, StyleSheet, View } from "react-native";
import { ScreenWrapperProps } from "../../../../types";
import { COLORS } from "../../../constants/theme";
import { getTopMargin } from "../../../utils/safe-data-utils";

const ScreenWrapper = ({ style, children }: ScreenWrapperProps) => {
  return (
    <View style={[styles.container, style]}>
      <StatusBar barStyle={"light-content"} />
      {children}
    </View>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral900,
    paddingTop: getTopMargin(),
  },
});
