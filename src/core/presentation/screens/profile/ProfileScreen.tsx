import { auth } from "@/src/config/firebase";
import { COLORS, radius, spacingX, spacingY } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/authContext";
import { getProfileImage } from "@/src/utils/image-utils";
import { verticalScale } from "@/src/utils/styling";
import { AccountOptionType } from "@/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import * as Icons from "phosphor-react-native";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Header, ScreenWrapper, Typography } from "../../components";

const ProfileScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const accountOptionList: AccountOptionType[] = [
    {
      title: "Edit Profile",
      icon: <Icons.UserIcon size={26} color={COLORS.white} weight={"fill"} />,
      routeName: "/(modals)/profileModal",
      bgColor: "#6366F1",
    },
    {
      title: "Settings",
      icon: (
        <Icons.GearSixIcon size={26} color={COLORS.white} weight={"fill"} />
      ),
      //   routeName: "/(modals)/profileModal",
      bgColor: "#059669",
    },
    {
      title: "Privacy Policy",
      icon: <Icons.LockIcon size={26} color={COLORS.white} weight={"fill"} />,
      //   routeName: "/(modals)/profileModal",
      bgColor: COLORS.neutral600,
    },
    {
      title: "Logout",
      icon: <Icons.PowerIcon size={26} color={COLORS.white} weight={"fill"} />,
      //   routeName: "/(modals)/profileModal",
      bgColor: "#E11D48",
    },
  ];

  const _handleOptionPress = async (item: AccountOptionType) => {
    if (item.title === "Logout") {
      _showLogoutAlert();
    }
    if (item.routeName) {
      router.push(item.routeName);
    }
  };

  const _showLogoutAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to Logout?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => _handleLogout(),
        style: "destructive",
      },
    ]);
  };

  const _handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title={"Profile"} style={styles.headerContainer} />

        {/* User Info */}
        <View style={styles.userInfo}>
          {/* Avatar */}
          <View style={styles.userInfo}>
            <Image
              source={getProfileImage(user?.image)}
              style={styles.avatar}
              contentFit="cover"
              transition={100}
            />
          </View>
          {/* Name & Email */}
          <View style={styles.nameContainer}>
            <Typography size={24} fontWeight={"600"} color={COLORS.neutral100}>
              {user?.name}
            </Typography>
            <Typography size={15} color={COLORS.neutral400}>
              {user?.email}
            </Typography>
          </View>
        </View>

        {/* Account Options */}
        <View style={styles.accountOptions}>
          {accountOptionList.map((item, index) => {
            return (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 50)
                  .springify()
                  .damping(14)}
                style={styles.listItem}
              >
                <TouchableOpacity
                  style={styles.flexRow}
                  onPress={() => _handleOptionPress(item)}
                >
                  <View
                    style={[styles.listIcon, { backgroundColor: item.bgColor }]}
                  >
                    {item?.icon && item.icon}
                  </View>
                  <Typography
                    size={16}
                    fontWeight={"500"}
                    style={styles.itemText}
                  >
                    {item.title}
                  </Typography>
                  <Icons.CaretRightIcon
                    size={verticalScale(20)}
                    weight={"bold"}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  headerContainer: {
    marginVertical: spacingY._10,
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: "center",
    gap: spacingY._15,
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
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 8,
    borderRadius: 50,
    backgroundColor: COLORS.neutral100,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: 5,
  },
  nameContainer: {
    gap: verticalScale(4),
    alignItems: "center",
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    backgroundColor: COLORS.neutral500,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  listItem: {
    marginBottom: verticalScale(17),
  },
  accountOptions: {
    marginTop: spacingY._35,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemText: {
    flex: 1,
  },
});
