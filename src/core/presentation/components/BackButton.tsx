import { useRouter } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import { BackButtonProps } from "../../../../types";
import { COLORS, radius } from "../../../constants/theme";
import { verticalScale } from "../../../utils/styling";

const BackButton = ({ style, iconSize = 26 }: BackButtonProps) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={[styles.button, style]}
    >
      <CaretLeftIcon
        size={verticalScale(iconSize)}
        color={COLORS.white}
        weight={"bold"}
      />
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.neutral600,
    alignSelf: "flex-start",
    borderRadius: radius._12,
    borderCurve: "continuous",
    padding: 5,
  },
});
