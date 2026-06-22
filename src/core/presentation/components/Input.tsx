import { StyleSheet, TextInput, View } from "react-native";
import { InputProps } from "../../../../types";
import { COLORS, radius, spacingX } from "../../../constants/theme";
import { verticalScale } from "../../../utils/styling";

const Input = ({
  icon,
  containerStyle,
  inputStyle,
  inputRef,
  ...rest
}: InputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {icon}
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor={COLORS.neutral400}
        ref={inputRef}
        {...rest}
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
    gap: spacingX._7,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: verticalScale(14),
  },
});
