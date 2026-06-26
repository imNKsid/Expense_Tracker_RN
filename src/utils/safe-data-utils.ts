import { Dimensions, Platform, StatusBar } from "react-native";

const { width, height } = Dimensions.get("window");

export const WindowWidth = width;
export const WindowHeight = height;

/**
 * Function is used to check Platform is Android or not
 */
export const isAndroid = () => {
  return Platform.OS === "android";
};

/**
 * Function is used to check Platform is IOS or not
 */
export const isIOS = () => {
  return Platform.OS === "ios";
};

/**
 * Function to get Top margin for Status Bar
 */
const statusBarHeight: number = StatusBar.currentHeight ?? 0;

export const getTopMargin = (): number => {
  return isIOS()
    ? WindowHeight * 0.06
    : statusBarHeight > 0
      ? statusBarHeight
      : 40;
  // return isIOS() ? WindowHeight * 0.06 : 50;
};
