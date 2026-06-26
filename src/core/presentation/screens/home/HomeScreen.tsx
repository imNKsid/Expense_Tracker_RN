import { COLORS, spacingX, spacingY } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/authContext";
import { useFetchData } from "@/src/core/domain/hooks/useFetchData";
import { verticalScale } from "@/src/utils/styling";
import { TransactionType } from "@/types";
import { useRouter } from "expo-router";
import { limit, orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  CustomButton,
  HomeCard,
  ScreenWrapper,
  TransactionList,
  Typography,
} from "../../components";

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const constraints = [
    where("uid", "==", user?.uid),
    orderBy("date", "desc"),
    limit(30),
  ];

  const {
    data: recentTransactionList,
    error,
    isLoading,
  } = useFetchData<TransactionType>("transactions", constraints);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Typography size={16} color={COLORS.neutral400}>
              Hello,
            </Typography>
            <Typography size={20} fontWeight={"500"}>
              {user?.name}
            </Typography>
          </View>
          <TouchableOpacity style={styles.searchIcon}>
            <Icons.MagnifyingGlassIcon
              size={verticalScale(22)}
              color={COLORS.neutral200}
              weight={"bold"}
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          <HomeCard />
          <TransactionList
            title={"Recent Transactions"}
            data={recentTransactionList}
            loading={isLoading}
            emptyListMessage={"No transactions added yet!"}
          />
        </ScrollView>

        {/* Plus Button */}
        <CustomButton
          style={styles.floatingButton}
          onPress={() => router.push("/(modals)/transactionModal")}
        >
          <Icons.PlusIcon
            color={COLORS.black}
            weight={"bold"}
            size={verticalScale(24)}
          />
        </CustomButton>
      </View>
    </ScreenWrapper>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  headerText: {
    gap: 4,
  },
  searchIcon: {
    backgroundColor: COLORS.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
  scrollViewStyle: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25,
  },
});
