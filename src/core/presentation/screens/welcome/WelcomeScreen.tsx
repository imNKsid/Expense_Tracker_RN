import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { IMG_WELCOME_IMAGE } from "../../../../assets/images";
import { COLORS, spacingX, spacingY } from "../../../../constants/theme";
import { verticalScale } from "../../../../utils/styling";
import { CustomButton, ScreenWrapper, Typography } from "../../components";

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <ScreenWrapper>
      {/* Login button & Welcome Image */}
      <View style={styles.container}>
        <View>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Typography fontWeight={"500"}>Sign In</Typography>
          </TouchableOpacity>
          <Animated.Image
            entering={FadeIn.duration(3000)}
            source={IMG_WELCOME_IMAGE}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Animated.View
            entering={FadeInDown.duration(1000).springify().damping(12)}
            style={styles.footerTitleContainer}
          >
            <Typography size={30} fontWeight={"800"}>
              Always take control
            </Typography>
            <Typography size={30} fontWeight={"800"}>
              of your finances
            </Typography>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(100)
              .springify()
              .damping(12)}
            style={styles.footerDescContainer}
          >
            <Typography size={17} color={COLORS.textLight}>
              Finances must be arranged to set a better
            </Typography>
            <Typography size={17} color={COLORS.textLight}>
              Lifestyle in future
            </Typography>
          </Animated.View>

          {/* Button */}
          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(200)
              .springify()
              .damping(12)}
            style={styles.buttonContainer}
          >
            <CustomButton onPress={() => router.push("/(auth)/register")}>
              <Typography
                size={20}
                color={COLORS.neutral900}
                fontWeight={"600"}
              >
                Get Started
              </Typography>
            </CustomButton>
          </Animated.View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: spacingY._7,
  },
  welcomeImage: {
    width: "100%",
    height: verticalScale(300),
    alignSelf: "center",
    marginTop: verticalScale(100),
  },
  loginButton: {
    alignSelf: "flex-end",
    marginRight: spacingX._20,
  },
  footer: {
    backgroundColor: COLORS.neutral900,
    alignItems: "center",
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(45),
    gap: spacingY._20,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: -10 },
    elevation: 10,
    shadowRadius: 25,
    shadowOpacity: 0.15,
  },
  footerTitleContainer: {
    alignItems: "center",
  },
  footerDescContainer: {
    alignItems: "center",
    gap: 2,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacingX._25,
  },
});
