import { expenseCategories, incomeCategory } from "@/src/constants/data";
import { COLORS, radius, spacingX, spacingY } from "@/src/constants/theme";
import { verticalScale } from "@/src/utils/styling";
import { TransactionListType, TransactionType } from "@/types";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Loading from "../Loading";
import Typography from "../Typography";

const TransactionList = ({
  title,
  data,
  loading,
  emptyListMessage,
}: TransactionListType) => {
  const router = useRouter();

  const _handleClick = (item: TransactionType) => {
    router.push({
      pathname: "/(modals)/transactionModal",
      params: {
        id: item.id,
        type: item.type,
        amount: item.amount,
        category: item.category,
        date: (item.date as Timestamp).toDate().toISOString(),
        description: item.description,
        image: item.image,
        uid: item.uid,
        walletId: item.walletId,
      },
    });
  };

  const _renderTransactionItem = ({
    item,
    index,
  }: {
    item: TransactionType;
    index: number;
  }) => {
    const isIncome = item.type === "income";

    const category = isIncome
      ? incomeCategory
      : expenseCategories[item.category!];
    const IconComponent = category.icon;

    const date = (item.date as Timestamp)
      ?.toDate()
      ?.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100)
          .springify()
          .damping(14)}
      >
        <TouchableOpacity style={styles.row} onPress={() => _handleClick(item)}>
          <View style={[styles.icon, { backgroundColor: category.bgColor }]}>
            <IconComponent
              size={verticalScale(25)}
              weight={"fill"}
              color={COLORS.white}
            />
          </View>
          <View style={styles.categoryDesc}>
            <Typography size={17}>{category.label}</Typography>
            {item.description && (
              <Typography
                size={12}
                color={COLORS.neutral400}
                textProps={{ numberOfLines: 1 }}
              >
                {item.description}
              </Typography>
            )}
          </View>

          <View style={styles.amountDate}>
            <Typography
              fontWeight={"500"}
              color={isIncome ? COLORS.primary : COLORS.rose}
            >
              {`${isIncome ? "+ $" : "- $"} ${item.amount}`}
            </Typography>
            <Typography size={13} color={COLORS.neutral400}>
              {date}
            </Typography>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {title && (
        <Typography size={20} fontWeight={"500"}>
          {title}
        </Typography>
      )}
      <View style={styles.list}>
        <FlashList
          data={data}
          renderItem={_renderTransactionItem}
          keyExtractor={(_item, index) => index.toString()}
        />
      </View>

      {/* No Data Message */}
      {!loading && data.length === 0 && (
        <Typography
          size={15}
          color={COLORS.neutral400}
          style={styles.emptyContainer}
        >
          {emptyListMessage}
        </Typography>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loading}>
          <Loading />
        </View>
      )}
    </View>
  );
};

export default TransactionList;

const styles = StyleSheet.create({
  container: {
    gap: spacingY._17,
  },
  list: {
    minHeight: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacingX._12,
    marginBottom: spacingY._12,

    // list with background
    backgroundColor: COLORS.neutral800,
    padding: spacingY._10,
    paddingHorizontal: spacingY._10,
    borderRadius: radius._17,
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._12,
    borderCurve: "continuous",
  },
  categoryDesc: {
    flex: 1,
    gap: 2.5,
  },
  amountDate: {
    alignItems: "flex-end",
    gap: 3,
  },
  emptyContainer: {
    textAlign: "center",
    marginTop: spacingY._15,
  },
  loading: {
    top: verticalScale(100),
  },
});
