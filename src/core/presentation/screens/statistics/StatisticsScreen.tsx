import { COLORS, radius, spacingX, spacingY } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/authContext";
import {
  fetchMonthlyStats,
  fetchWeeklyStats,
  fetchYearlyStats,
} from "@/src/core/domain/services/TransactionService";
import { scale, verticalScale } from "@/src/utils/styling";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import {
  Header,
  Loading,
  ScreenWrapper,
  TransactionList,
} from "../../components";

const StatisticsScreen = () => {
  const { user } = useAuth();

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  const [chartData, setChartData] = useState([]);
  const [transactionList, setTransactionList] = useState([]);

  useEffect(() => {
    if (activeIndex === 0) {
      _getWeeklyStats();
    }
    if (activeIndex === 1) {
      _getMonthlyStats();
    }
    if (activeIndex === 2) {
      _getYearlyStats();
    }
  }, [activeIndex]);

  const _getWeeklyStats = async () => {
    setIsChartLoading(true);
    const res = await fetchWeeklyStats(user?.uid as string);

    setIsChartLoading(false);

    if (res.success) {
      setChartData(res.data.stats);
      setTransactionList(res.data.transactionList);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const _getMonthlyStats = async () => {
    setIsChartLoading(true);
    const res = await fetchMonthlyStats(user?.uid as string);

    setIsChartLoading(false);

    if (res.success) {
      setChartData(res.data.stats);
      setTransactionList(res.data.transactionList);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const _getYearlyStats = async () => {
    setIsChartLoading(true);
    const res = await fetchYearlyStats(user?.uid as string);

    setIsChartLoading(false);

    if (res.success) {
      setChartData(res.data.stats);
      setTransactionList(res.data.transactionList);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View>
          <Header title={"Statistics"} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollviewContent}
          showsVerticalScrollIndicator={false}
        >
          <SegmentedControl
            values={["Weekly", "Monthly", "Yearly"]}
            selectedIndex={activeIndex}
            onChange={(event) =>
              setActiveIndex(event.nativeEvent.selectedSegmentIndex)
            }
            tintColor={COLORS.neutral200}
            backgroundColor={COLORS.neutral800}
            appearance={"dark"}
            activeFontStyle={styles.segmentFontStyle}
            style={styles.segmentStyle}
            fontStyle={{ ...styles.segmentFontStyle, color: COLORS.white }}
          />
          <View style={styles.chartContainer}>
            {chartData.length > 0 ? (
              <BarChart
                data={chartData}
                barWidth={scale(12)}
                spacing={[1, 2].includes(activeIndex) ? scale(25) : scale(16)}
                roundedTop
                roundedBottom
                hideRules
                yAxisLabelPrefix="$"
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisLabelWidth={scale(32)}
                yAxisTextStyle={{ color: COLORS.neutral350 }}
                xAxisLabelTextStyle={{
                  color: COLORS.neutral350,
                  fontSize: verticalScale(12),
                }}
                noOfSections={3}
                minHeight={5}
                disablePress
              />
            ) : (
              <View style={styles.noChart} />
            )}

            {isChartLoading && (
              <View style={styles.chartLoadingContainer}>
                <Loading color={COLORS.white} />
              </View>
            )}
          </View>

          <TransactionList
            title={"Transactions"}
            data={transactionList}
            loading={isChartLoading}
            emptyListMessage={"No transactions found!"}
          />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default StatisticsScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10,
  },
  scrollviewContent: {
    gap: spacingY._20,
    paddingTop: spacingY._5,
    paddingBottom: verticalScale(100),
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "bold",
    color: COLORS.black,
  },
  segmentStyle: {
    height: scale(37),
  },
  chartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  chartLoadingContainer: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.6)",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
  },
  noChart: {
    backgroundColor: "rgba(0,0,0,0.6)",
    height: verticalScale(210),
  },
  searchIcon: {
    backgroundColor: COLORS.neutral700,
    height: verticalScale(35),
    width: verticalScale(35),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    borderCurve: "continuous",
  },
});
