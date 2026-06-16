import { StyleSheet, Text, TextStyle } from "react-native";
import { TypoProps } from "../../../../types";
import { COLORS } from "../../../constants/theme";
import { verticalScale } from "../../../utils/styling";

const Typography = ({
  size,
  color = COLORS.text,
  fontWeight = "400",
  style,
  textProps,
  children,
}: TypoProps) => {
  const textStyle: TextStyle = {
    fontSize: size ? verticalScale(size) : verticalScale(18),
    color,
    fontWeight,
  };

  return (
    <Text style={[textStyle, style]} {...textProps}>
      {children}
    </Text>
  );
};

export default Typography;

const styles = StyleSheet.create({});
