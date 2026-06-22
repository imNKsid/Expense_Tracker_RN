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

const RegisterScreen = () => {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const emailRef = useRef("");
  const passwordRef = useRef("");
  const nameRef = useRef("");

  const [isLoading, setIsLoading] = useState(false);

  const _handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert("Sign Up", "Please fill all the fields");
      return;
    }
    setIsLoading(true);

    const res = await registerUser(
      nameRef.current,
      emailRef.current,
      passwordRef.current,
    );
    setIsLoading(false);

    if (!res.success) {
      Alert.alert("Sign up failed", res.msg);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={styles.titleContainer}>
          <Typography size={30} fontWeight={"800"}>
            Let's
          </Typography>
          <Typography size={30} fontWeight={"800"}>
            Get Started
          </Typography>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Typography size={16} color={COLORS.textLighter}>
            Create an account to track all your expenses
          </Typography>
        </View>
        <Input
          placeholder="Enter your name"
          icon={
            <Icons.AtIcon
              size={verticalScale(26)}
              color={COLORS.neutral300}
              weight="fill"
            />
          }
          onChangeText={(val) => (nameRef.current = val)}
        />
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

        <CustomButton loading={isLoading} onPress={_handleSubmit}>
          <Typography size={21} fontWeight={"700"} color={COLORS.black}>
            Sign Up
          </Typography>
        </CustomButton>

        <View style={styles.footer}>
          <Typography size={15}>Already have an account?</Typography>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Typography size={15} fontWeight={"700"} color={COLORS.primary}>
              login
            </Typography>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default RegisterScreen;

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
