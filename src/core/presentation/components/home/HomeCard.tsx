import { IMG_CARD_IMAGE } from "@/src/assets/images";
import { COLORS, spacingX, spacingY } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/authContext";
import { useFetchData } from "@/src/core/domain/hooks/useFetchData";
import { scale, verticalScale } from "@/src/utils/styling";
import { WalletType } from "@/types";
import { orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import { ImageBackground, StyleSheet, View } from "react-native";
import Typography from "../Typography";

interface WalletTotal {
  balance: number;
  income: number;
  expenses: number;
}

const HomeCard = () => {
  const { user } = useAuth();

  const {
    data: walletList,
    error,
    isLoading,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  const _getTotal = (): WalletTotal => {
    return walletList.reduce(
      (total, item: WalletType) => {
        total.balance = total.balance + Number(item.amount);
        total.income = total.income + Number(item.totalIncome);
        total.expenses = total.expenses + Number(item.totalExpenses);

        return total;
      },
      { balance: 0, income: 0, expenses: 0 },
    );
  };

  return (
    <ImageBackground
      source={IMG_CARD_IMAGE}
      resizeMode={"stretch"}
      style={styles.bgImage}
    >
      <View style={styles.container}>
        <View>
          <View style={styles.totalBalanceRow}>
            <Typography size={17} color={COLORS.neutral800} fontWeight={"500"}>
              Total Balance
            </Typography>
            <Icons.DotsThreeOutlineIcon
              size={verticalScale(23)}
              color={COLORS.black}
              weight={"fill"}
            />
          </View>
          <Typography size={30} color={COLORS.black} fontWeight={"bold"}>
            $ {isLoading ? "---" : _getTotal().balance.toFixed(2)}
          </Typography>
        </View>

        {/* Total income & expenses */}
        <View style={styles.stats}>
          {/* Income */}
          <View style={styles.incomeContainer}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowDownIcon
                  size={verticalScale(15)}
                  color={COLORS.black}
                  weight={"bold"}
                />
              </View>
              <Typography
                size={16}
                color={COLORS.neutral700}
                fontWeight={"500"}
              >
                Income
              </Typography>
            </View>
            <View style={styles.incomeValue}>
              <Typography size={17} color={COLORS.green} fontWeight={"600"}>
                $ {isLoading ? "---" : _getTotal().income.toFixed(2)}
              </Typography>
            </View>
          </View>
          {/* Expenses */}
          <View style={styles.incomeContainer}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowUpIcon
                  size={verticalScale(15)}
                  color={COLORS.black}
                  weight={"bold"}
                />
              </View>
              <Typography
                size={16}
                color={COLORS.neutral700}
                fontWeight={"500"}
              >
                Expense
              </Typography>
            </View>
            <View style={styles.incomeValue}>
              <Typography size={17} color={COLORS.rose} fontWeight={"600"}>
                $ {isLoading ? "---" : _getTotal().expenses.toFixed(2)}
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HomeCard;

const styles = StyleSheet.create({
  bgImage: {
    height: scale(210),
    width: "100%",
  },
  container: {
    height: "87%",
    width: "100%",
    padding: spacingX._20,
    paddingHorizontal: scale(23),
    justifyContent: "space-between",
  },
  totalBalanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacingY._5,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  incomeContainer: {
    gap: verticalScale(5),
  },
  incomeExpense: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingY._7,
  },
  statsIcon: {
    backgroundColor: COLORS.neutral350,
    padding: spacingY._5,
    borderRadius: 50,
  },
  incomeValue: {
    alignSelf: "center",
  },
});
