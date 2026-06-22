import { useAuth } from "@/src/contexts/authContext";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { COLORS, spacingX, spacingY } from "../../../../constants/theme";
import { verticalScale } from "../../../../utils/styling";
import {
  BackButton,
  CustomButton,
  Input,
  ScreenWrapper,
  Typography,
} from "../../components";

const LoginScreen = () => {
  const router = useRouter();

  const { login: loginUser } = useAuth();

  const emailRef = useRef("");
  const passwordRef = useRef("");

  const [isLoading, setIsLoading] = useState(false);

  const _handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Login", "Please fill all the fields");
      return;
    }

    setIsLoading(true);

    const res = await loginUser(emailRef.current, passwordRef.current);
    setIsLoading(false);

    if (!res.success) {
      Alert.alert("Login", res.msg);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={styles.titleContainer}>
          <Typography size={30} fontWeight={"800"}>
            Hey,
          </Typography>
          <Typography size={30} fontWeight={"800"}>
            Welcome Back
          </Typography>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Typography size={16} color={COLORS.textLighter}>
            Login now to track all your expenses
          </Typography>
        </View>
        <Input
          placeholder="Enter your email"
          icon={
            <Icons.AtIcon
              size={verticalScale(26)}
              color={COLORS.neutral300}
              weight="fill"
            />
          }
          onChangeText={(val) => (emailRef.current = val)}
        />
        <Input
          placeholder="Enter your password"
          secureTextEntry
          icon={
            <Icons.LockIcon
              size={verticalScale(26)}
              color={COLORS.neutral300}
              weight="fill"
            />
          }
          onChangeText={(val) => (passwordRef.current = val)}
        />

        <Typography
          size={14}
          color={COLORS.text}
          style={styles.forgotPasswordText}
        >
          Forgot Password?
        </Typography>

        <CustomButton loading={isLoading} onPress={_handleSubmit}>
          <Typography size={21} fontWeight={"700"} color={COLORS.black}>
            Login
          </Typography>
        </CustomButton>

        <View style={styles.footer}>
          <Typography size={15}>Don't have an account?</Typography>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Typography size={15} fontWeight={"700"} color={COLORS.primary}>
              Sign Up
            </Typography>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  titleContainer: {
    marginTop: spacingY._20,
    gap: 5,
  },
  welcomeText: {
    fontSize: verticalScale(20),
    fontWeight: "bold",
    color: COLORS.text,
  },
  form: {
    gap: spacingY._20,
  },
  forgotPasswordText: {
    alignSelf: "flex-end",
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: "500",
    color: COLORS.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: COLORS.text,
    fontSize: verticalScale(15),
  },
});
