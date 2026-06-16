import { Dimensions, PixelRatio } from "react-native";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

const [shortDimension, longDimension] =
  WINDOW_WIDTH < WINDOW_HEIGHT
    ? [WINDOW_WIDTH, WINDOW_HEIGHT]
    : [WINDOW_HEIGHT, WINDOW_WIDTH];

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel(
      (shortDimension / guidelineBaseWidth) * (size as number),
    ),
  );

export const verticalScale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel(
      (longDimension / guidelineBaseHeight) * (size as number),
    ),
  );
