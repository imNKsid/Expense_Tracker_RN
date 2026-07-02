import { COLORS, radius, spacingX, spacingY } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/authContext";
import { useFetchData } from "@/src/core/domain/hooks/useFetchData";
import { verticalScale } from "@/src/utils/styling";
import { WalletType } from "@/types";
import { useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Loading,
  ScreenWrapper,
  Typography,
  WalletListItem,
} from "../../components";

const WalletScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: walletList,
    error,
    isLoading,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  const _getTotalBalance = () => {
    return walletList.reduce((total, item) => {
      total = total + (item?.amount || 0);
      return total;
    }, 0);
  };

  const _renderWalletItem = ({
    item,
    index,
  }: {
    item: WalletType;
    index: number;
  }) => <WalletListItem item={item} index={index} router={router} />;

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.mainContainer}>
        {/* Balance */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceView}>
            <Typography size={45} fontWeight={"500"}>
              ${_getTotalBalance().toFixed(2)}
            </Typography>
            <Typography size={16} color={COLORS.neutral300}>
              Total Balance
            </Typography>
          </View>
        </View>

        {/* Wallets */}
        <View style={styles.wallets}>
          {/* Header */}
          <View style={styles.flexRow}>
            <Typography size={20} fontWeight={"500"}>
              My Wallets
            </Typography>
            <TouchableOpacity
              onPress={() => router.push("(modals)/walletModal")}
            >
              <Icons.PlusCircleIcon
                weight={"fill"}
                color={COLORS.primary}
                size={verticalScale(33)}
              />
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {isLoading && <Loading />}
          <FlatList
            data={walletList}
            renderItem={_renderWalletItem}
            keyExtractor={(_item, index) => index.toString()}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.black,
  },
  mainContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  balanceContainer: {
    height: verticalScale(160),
    backgroundColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceView: {
    alignItems: "center",
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  wallets: {
    flex: 1,
    backgroundColor: COLORS.neutral900,
    borderTopRightRadius: radius._30,
    borderTopLeftRadius: radius._30,
    padding: spacingX._20,
    paddingTop: spacingX._25,
  },
  listStyle: {
    paddingVertical: spacingY._25,
    paddingTop: spacingY._15,
  },
});
