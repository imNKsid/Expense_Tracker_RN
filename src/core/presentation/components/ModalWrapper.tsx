import { COLORS, spacingY } from "@/src/constants/theme";
import { isIOS } from "@/src/utils/safe-data-utils";
import { ModalWrapperProps } from "@/types";
import { StyleSheet, View } from "react-native";

const isIosPlatform = isIOS();

const ModalWrapper = ({
  style,
  children,
  bgColor = COLORS.neutral800,
}: ModalWrapperProps) => {
  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      {children}
    </View>
  );
};

export default ModalWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: isIosPlatform ? spacingY._15 : 50,
    paddingBottom: isIosPlatform ? spacingY._20 : spacingY._10,
  },
});
