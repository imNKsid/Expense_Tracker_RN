import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { IMG_SPLASH_IMAGE } from "../src/assets/images";
import { COLORS } from "../src/constants/theme";

const index = () => {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/welcome");
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        resizeMode="contain"
        source={IMG_SPLASH_IMAGE}
      />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.neutral900,
  },
  logo: {
    height: "20%",
    aspectRatio: 1,
  },
});
