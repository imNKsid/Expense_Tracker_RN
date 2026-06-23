import { COLORS, radius, spacingX } from "@/src/constants/theme";
import { verticalScale } from "@/src/utils/styling";
import { WalletType } from "@/types";
import { Image } from "expo-image";
import { ImperativeRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Typography from "../Typography";

interface WalletListItemProps {
  item: WalletType;
  index: number;
  router: ImperativeRouter;
}

const WalletListItem = ({ item, index, router }: WalletListItemProps) => {
  const _openWallet = () => {
    router.push({
      pathname: "/(modals)/walletModal",
      params: {
        id: item?.id,
        name: item?.name,
        image: JSON.stringify(item?.image),
      },
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .springify()
        .damping(13)}
    >
      <TouchableOpacity style={styles.container} onPress={_openWallet}>
        {/* Wallet Image */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={item?.image}
            contentFit={"cover"}
            transition={100}
          />
        </View>
        {/* Wallet Name & Amount */}
        <View style={styles.nameContainer}>
          <Typography size={16}>{item.name}</Typography>
          <Typography size={14} color={COLORS.neutral400}>
            ${item.amount}
          </Typography>
        </View>

        <Icons.CaretRightIcon
          size={verticalScale(20)}
          weight={"bold"}
          color={COLORS.white}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default WalletListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(17),
  },
  imageContainer: {
    height: verticalScale(45),
    width: verticalScale(45),
    borderWidth: 1,
    borderRadius: radius._12,
    borderColor: COLORS.neutral600,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  image: {
    flex: 1,
  },
  nameContainer: {
    flex: 1,
    gap: 2,
    marginLeft: spacingX._10,
  },
});
