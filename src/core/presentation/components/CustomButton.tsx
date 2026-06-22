import { StyleSheet, TouchableOpacity, View } from "react-native";
import { CustomButtonProps } from "../../../../types";
import { COLORS, radius } from "../../../constants/theme";
import { verticalScale } from "../../../utils/styling";
import Loading from "./Loading";

const CustomButton = ({
  style,
  onPress,
  loading = false,
  children,
}: CustomButtonProps) => {
  if (loading) {
    return (
      <View style={[styles.button, styles.loadingButton, style]}>
        <Loading />
      </View>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      {children}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  loadingButton: {
    backgroundColor: "transparent",
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: radius._17,
    borderCurve: "continuous",
    height: verticalScale(52),
    justifyContent: "center",
    alignItems: "center",
  },
});
