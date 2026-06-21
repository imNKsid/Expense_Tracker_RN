import { COLORS, radius } from "@/src/constants/theme";
import { getFilePath } from "@/src/utils/image-utils";
import { scale, verticalScale } from "@/src/utils/styling";
import { ImageUploadProps } from "@/types";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Icons from "phosphor-react-native";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Typography from "./Typography";

const ImageUpload = ({
  placeholder = "",
  file = null,
  onSelect,
  onClear,
  containerStyle,
  imageStyle,
}: ImageUploadProps) => {
  const _handleImagePicker = async () => {
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
      mediaTypes: ["images"],
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      onSelect(result.assets[0]);
    }
  };

  return (
    <View>
      {!file && (
        <TouchableOpacity
          style={[styles.inputContainer, containerStyle]}
          onPress={_handleImagePicker}
        >
          <Icons.UploadSimpleIcon color={COLORS.neutral200} />
          {placeholder && <Typography size={15}>{placeholder}</Typography>}
        </TouchableOpacity>
      )}
      {file && (
        <View style={[styles.imageContainer, imageStyle]}>
          <Image
            style={styles.image}
            source={getFilePath(file)}
            contentFit={"cover"}
            transition={100}
          />
          <TouchableOpacity style={styles.deleteIcon} onPress={onClear}>
            <Icons.XCircleIcon
              size={verticalScale(24)}
              weight={"fill"}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ImageUpload;

const styles = StyleSheet.create({
  inputContainer: {
    height: verticalScale(54),
    backgroundColor: COLORS.neutral700,
    borderRadius: radius._15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.neutral500,
    borderStyle: "dashed",
  },
  imageContainer: {
    height: scale(150),
    width: scale(150),
    borderRadius: radius._15,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  image: { flex: 1 },
  deleteIcon: {
    position: "absolute",
    top: scale(6),
    right: scale(6),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});
