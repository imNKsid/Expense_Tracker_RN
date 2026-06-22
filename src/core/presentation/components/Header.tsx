import { HeaderProps } from "@/types";
import { StyleSheet, View } from "react-native";
import Typography from "./Typography";

const Header = ({ title, style, leftIcon, rightIcon }: HeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
      {title && (
        <Typography
          size={22}
          fontWeight={"600"}
          style={{ ...styles.headerText, width: leftIcon ? "82%" : "100%" }}
        >
          {title}
        </Typography>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
  },
  leftIconContainer: {
    alignSelf: "flex-start",
  },
  headerText: {
    textAlign: "center",
  },
});
