import { COLORS, spacingX, spacingY } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/authContext";
import { updateUser } from "@/src/core/domain/services/UserService";
import { getProfileImage } from "@/src/utils/image-utils";
import { scale, verticalScale } from "@/src/utils/styling";
import { UserDataType } from "@/types";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import BackButton from "../BackButton";
import CustomButton from "../CustomButton";
import Header from "../Header";
import Input from "../Input";
import ModalWrapper from "../ModalWrapper";
import Typography from "../Typography";

const ProfileModal = () => {
  const router = useRouter();

  const { user, updateUserData } = useAuth();

  const [userData, setUserData] = useState<UserDataType>({
    name: "",
    image: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setUserData({
      name: user?.name || "",
      image: user?.image || null,
    });
  }, [user]);

  const _handleSubmit = async () => {
    setIsLoading(true);
    const { name, image } = userData;

    if (!name.trim()) {
      Alert.alert("User", "Please fill all the fields!");
    }

    const res = await updateUser(user?.uid as string, userData);
    setIsLoading(false);

    if (res.success) {
      // Update user's data in the DB
      updateUserData(user?.uid as string);
      router.back();
    } else {
      Alert.alert("User", res.msg);
    }
  };

  const _handleImagePicker = async () => {
    // No permissions request is necessary for launching the image library.
    // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
    // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
    // so the app users aren't surprised by a system dialog after picking a video.
    // See "Invoke permissions for videos" sub section for more details.
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setUserData({ ...userData, image: result.assets[0] });
    }
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title="Update Profile"
          leftIcon={<BackButton />}
          style={styles.header}
        />

        {/* Form */}
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.avatarContainer}>
            <Image
              style={styles.avatar}
              source={getProfileImage(userData.image)}
              contentFit={"cover"}
              transition={100}
            />
            <TouchableOpacity
              style={styles.editIcon}
              onPress={_handleImagePicker}
            >
              <Icons.PencilIcon
                size={verticalScale(20)}
                color={COLORS.neutral800}
              />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <View style={styles.inputContainer}>
            <Typography color={COLORS.neutral200}>Name</Typography>
            <Input
              placeholder="Enter your name"
              value={userData.name}
              onChangeText={(val) => setUserData({ ...userData, name: val })}
            />
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <CustomButton
          onPress={_handleSubmit}
          style={styles.buttonContainer}
          loading={isLoading}
        >
          <Typography color={COLORS.black} fontWeight={"700"}>
            Update
          </Typography>
        </CustomButton>
      </View>
    </ModalWrapper>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
  },
  header: {
    marginBottom: spacingY._10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: COLORS.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  buttonContainer: {
    flex: 1,
  },
  form: {
    marginTop: spacingY._15,
    gap: spacingY._30,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    alignSelf: "center",
    backgroundColor: COLORS.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    borderWidth: 1,
    borderColor: COLORS.neutral500,
  },
  editIcon: {
    position: "absolute",
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 50,
    backgroundColor: COLORS.neutral100,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },
  inputContainer: {
    gap: spacingY._10,
  },
});
