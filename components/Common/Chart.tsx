import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
  G,
  Rect,
} from "react-native-svg";
import Colors from "../../services/ColorPalette";

const SCREEN_WIDTH = Dimensions.get("window").width;

const VISIBLE_POINTS = 10;
const CHART_HEIGHT = 200;
const PADDING_TOP = 34;
const PADDING_BOTTOM = 12;
const SIDE_PADDING = 28;

export type ChartPoint = {
  id: string | number;
  date: Date;
  value: number;
};

type ChartDataPoint = ChartPoint & {
  isInterpolated: boolean;
};

type ReferenceCoord = {
  x: number;
  y: number;
  value: number;
};

type Props = {
  data: ChartPoint[];
  unit?: string;
  accentColor?: string;
  referenceColor?: string;
  referenceData?: {
    date: number;
    value: number;
  }[];
  referenceLabel?: string;
  decimals?: number;
  gap?: number;
};

export default function Chart({
  data,
  unit = "",
  accentColor = Colors.G700,
  referenceColor = Colors.AMBER500,
  referenceData = [],
  referenceLabel = "Average",
  decimals = 2,
  gap = 1,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const hasScrolledToEnd = useRef(false);

  const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());

  const firstDataDate = sorted.length > 0 ? startOfDay(sorted[0].date) : null;

  const sortedReference = React.useMemo(() => {
    if (!firstDataDate) {
      return [];
    }

    return [...referenceData]
      .map((item) => {
        const date = new Date(firstDataDate);

        date.setDate(date.getDate() + item.date);

        return {
          date,
          value: item.value,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [referenceData, firstDataDate]);

  /*
   * ---------------------------------------------------------
   * CHART DATE RANGE
   *
   * The chart extends to whichever is later:
   * - last data record
   * - last reference record
   * ---------------------------------------------------------
   */
  const chartStartDate = React.useMemo(() => {
    if (sorted.length === 0 && sortedReference.length === 0) {
      return null;
    }

    const dates = [
      ...sorted.map((item) => startOfDay(item.date).getTime()),
      ...sortedReference.map((item) => startOfDay(item.date).getTime()),
    ];

    return new Date(Math.min(...dates));
  }, [data, referenceData]);

  const chartEndDate = React.useMemo(() => {
    if (sorted.length === 0 && sortedReference.length === 0) {
      return null;
    }

    const dates = [
      ...sorted.map((item) => startOfDay(item.date).getTime()),
      ...sortedReference.map((item) => startOfDay(item.date).getTime()),
    ];

    return new Date(Math.max(...dates));
  }, [data, referenceData]);

  /*
   * ---------------------------------------------------------
   * DATA CHART
   *
   * Only generate data points until the LAST DATA RECORD.
   *
   * Missing dates between data records are interpolated.
   * ---------------------------------------------------------
   */
  const chartData = React.useMemo<ChartDataPoint[]>(() => {
    if (sorted.length === 0) {
      return [];
    }

    const safeGap = gap > 0 ? gap : 1;

    if (gap <= 0) {
      console.warn("Chart gap must be greater than 0. Using gap = 1.");
    }

    const firstDate = startOfDay(sorted[0].date);
    const lastDate = startOfDay(sorted[sorted.length - 1].date);

    const actualByDate = new Map<string, ChartPoint>();

    sorted.forEach((item) => {
      actualByDate.set(getDateKey(item.date), item);
    });

    const result: ChartDataPoint[] = [];

    let currentDate = new Date(firstDate);

    while (currentDate.getTime() <= lastDate.getTime()) {
      const key = getDateKey(currentDate);

      const actual = actualByDate.get(key);

      if (actual) {
        result.push({
          ...actual,
          date: new Date(currentDate),
          isInterpolated: false,
        });
      } else {
        const previous = findPreviousRecord(sorted, currentDate);
        const next = findNextRecord(sorted, currentDate);

        let interpolatedValue: number | null = null;

        if (previous && next) {
          const totalTime =
            startOfDay(next.date).getTime() -
            startOfDay(previous.date).getTime();

          const elapsedTime =
            currentDate.getTime() - startOfDay(previous.date).getTime();

          const progress = elapsedTime / totalTime;

          interpolatedValue =
            previous.value + (next.value - previous.value) * progress;
        } else if (previous) {
          interpolatedValue = previous.value;
        } else if (next) {
          interpolatedValue = next.value;
        }

        if (interpolatedValue !== null) {
          result.push({
            id: `interpolated-${key}`,
            date: new Date(currentDate),
            value: interpolatedValue,
            isInterpolated: true,
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + safeGap);
    }

    /*
     * Make sure the actual last data record is always included,
     * even if gap doesn't land exactly on it.
     */
    const lastGenerated =
      result.length > 0 ? result[result.length - 1].date : null;

    if (!lastGenerated || lastGenerated.getTime() !== lastDate.getTime()) {
      const actualLast = actualByDate.get(getDateKey(lastDate));

      if (actualLast) {
        result.push({
          ...actualLast,
          date: new Date(lastDate),
          isInterpolated: false,
        });
      }
    }

    return result;
  }, [data, gap]);

  /*
   * ---------------------------------------------------------
   * NUMBER OF POINTS / WIDTH
   *
   * The width is based on the COMPLETE chart date range,
   * including reference-only dates.
   * ---------------------------------------------------------
   */

  const chartDates = React.useMemo<ChartPoint[]>(() => {
    if (!chartStartDate || !chartEndDate) {
      return [];
    }

    const safeGap = gap > 0 ? gap : 1;

    const result: ChartPoint[] = [];

    let currentDate = new Date(chartStartDate);

    while (currentDate.getTime() <= chartEndDate.getTime()) {
      result.push({
        id: `chart-date-${getDateKey(currentDate)}`,
        date: new Date(currentDate),
        value: 0,
      });

      currentDate.setDate(currentDate.getDate() + safeGap);
    }

    /*
     * Ensure the exact last date exists.
     */
    if (
      result.length === 0 ||
      result[result.length - 1].date.getTime() !== chartEndDate.getTime()
    ) {
      result.push({
        id: `chart-date-${getDateKey(chartEndDate)}`,
        date: new Date(chartEndDate),
        value: 0,
      });
    }

    return result;
  }, [chartStartDate, chartEndDate, gap]);

  const totalPoints = chartDates.length;

  const dayWidth = SCREEN_WIDTH / VISIBLE_POINTS;

  const chartAreaWidth =
    Math.max(totalPoints, VISIBLE_POINTS) * dayWidth + SIDE_PADDING * 2;

  const isChartShort = totalPoints < VISIBLE_POINTS;

  const centerOffset = isChartShort
    ? ((VISIBLE_POINTS - totalPoints) * dayWidth) / 2
    : 0;

  /*
   * ---------------------------------------------------------
   * DATA COORDINATES
   *
   * Data only has coordinates until its own last record.
   * ---------------------------------------------------------
   */

  const dataCoords = chartData.map((item) => {
    const chartIndex = chartDates.findIndex(
      (date) => getDateKey(date.date) === getDateKey(item.date),
    );

    const x =
      SIDE_PADDING + centerOffset + chartIndex * dayWidth + dayWidth / 2;

    return {
      x,
      ...item,
    };
  });

  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(chartData.length - 1, 0),
  );

  const [refSelected, setRefSelected] = useState(false);
  const [refTouchX, setRefTouchX] = useState<number | null>(null);
  const [selectedReferenceValue, setSelectedReferenceValue] = useState<
    number | null
  >(null);

  useEffect(() => {
    setSelectedIndex(Math.max(chartData.length - 1, 0));
    hasScrolledToEnd.current = false;
  }, [chartData.length]);

  /*
   * ---------------------------------------------------------
   * VALUES / SCALE
   * ---------------------------------------------------------
   */

  const dataValues = chartData.map((d) => d.value);

  const referenceValues = sortedReference.map((d) => d.value);

  const allValues = [...dataValues, ...referenceValues];

  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0;

  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;

  const range = maxValue - minValue || 1;

  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const getY = (value: number) => {
    return PADDING_TOP + (1 - (value - minValue) / range) * plotHeight;
  };

  /*
   * ---------------------------------------------------------
   * DATA COORDINATES WITH Y
   * ---------------------------------------------------------
   */

  const coords = dataCoords.map((item) => ({
    ...item,
    y: getY(item.value),
  }));

  const pathD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");

  /*
   * ---------------------------------------------------------
   * REFERENCE LINE
   * ---------------------------------------------------------
   *
   * Reference line follows reference values.
   *
   * Before first reference:
   *   use first reference value.
   *
   * After last reference:
   *   use last reference value.
   *
   * Between reference records:
   *   interpolate linearly.
   * ---------------------------------------------------------
   */

  const referenceCoords = React.useMemo<ReferenceCoord[]>(() => {
    if (sortedReference.length === 0 || chartDates.length === 0) {
      return [];
    }

    const firstChartDate = chartDates[0].date.getTime();
    const lastChartDate = chartDates[chartDates.length - 1].date.getTime();

    const getXForDate = (date: Date) => {
      const time = startOfDay(date).getTime();

      /*
       * Before chart
       */
      if (time <= firstChartDate) {
        return SIDE_PADDING + centerOffset + dayWidth / 2;
      }

      /*
       * After chart
       */
      if (time >= lastChartDate) {
        return (
          SIDE_PADDING +
          centerOffset +
          (chartDates.length - 1) * dayWidth +
          dayWidth / 2
        );
      }

      /*
       * Exact date
       */
      const exactIndex = chartDates.findIndex(
        (item) => startOfDay(item.date).getTime() === time,
      );

      if (exactIndex >= 0) {
        return (
          SIDE_PADDING + centerOffset + exactIndex * dayWidth + dayWidth / 2
        );
      }

      /*
       * Between two chart dates
       */
      for (let i = 0; i < chartDates.length - 1; i++) {
        const current = chartDates[i].date.getTime();

        const next = chartDates[i + 1].date.getTime();

        if (time >= current && time <= next) {
          const progress = (time - current) / (next - current);

          const currentX =
            SIDE_PADDING + centerOffset + i * dayWidth + dayWidth / 2;

          const nextX =
            SIDE_PADDING + centerOffset + (i + 1) * dayWidth + dayWidth / 2;

          return currentX + (nextX - currentX) * progress;
        }
      }

      return SIDE_PADDING + centerOffset;
    };

    /*
     * Only one reference value
     * → completely horizontal line.
     */
    if (sortedReference.length === 1) {
      const value = sortedReference[0].value;

      return [
        {
          x: SIDE_PADDING + centerOffset + dayWidth / 2,
          y: getY(value),
          value,
        },
        {
          x:
            SIDE_PADDING +
            centerOffset +
            (chartDates.length - 1) * dayWidth +
            dayWidth / 2,
          y: getY(value),
          value,
        },
      ];
    }

    const result: ReferenceCoord[] = [];

    const firstReference = sortedReference[0];
    const lastReference = sortedReference[sortedReference.length - 1];

    /*
     * Extend first reference value backward
     * if reference starts after chart start.
     */
    if (startOfDay(firstReference.date).getTime() > firstChartDate) {
      result.push({
        x: SIDE_PADDING + centerOffset + dayWidth / 2,
        y: getY(firstReference.value),
        value: firstReference.value,
      });
    }

    /*
     * Add reference records.
     */
    sortedReference.forEach((reference) => {
      result.push({
        x: getXForDate(reference.date),
        y: getY(reference.value),
        value: reference.value,
      });
    });

    /*
     * Extend last reference value forward
     * if reference ends before chart end.
     */
    if (startOfDay(lastReference.date).getTime() < lastChartDate) {
      result.push({
        x:
          SIDE_PADDING +
          centerOffset +
          (chartDates.length - 1) * dayWidth +
          dayWidth / 2,
        y: getY(lastReference.value),
        value: lastReference.value,
      });
    }

    return result;
  }, [
    sortedReference,
    chartDates,
    centerOffset,
    dayWidth,
    minValue,
    range,
    plotHeight,
  ]);

  /*
   * ---------------------------------------------------------
   * GET REFERENCE VALUE AT CLICK POSITION
   * ---------------------------------------------------------
   */

  const getReferenceValueAtX = (x: number) => {
    if (referenceCoords.length === 0) {
      return null;
    }

    if (referenceCoords.length === 1) {
      return referenceCoords[0].value;
    }

    if (x <= referenceCoords[0].x) {
      return referenceCoords[0].value;
    }

    const last = referenceCoords[referenceCoords.length - 1];

    if (x >= last.x) {
      return last.value;
    }

    for (let i = 0; i < referenceCoords.length - 1; i++) {
      const current = referenceCoords[i];
      const next = referenceCoords[i + 1];

      if (x >= current.x && x <= next.x) {
        const progress = (x - current.x) / (next.x - current.x);

        return current.value + (next.value - current.value) * progress;
      }
    }

    return null;
  };

  /*
   * ---------------------------------------------------------
   * SCROLL
   * ---------------------------------------------------------
   */

  const lastDataX = coords.length > 0 ? coords[coords.length - 1].x : 0;

  const initialOffset = Math.max(
    lastDataX - SCREEN_WIDTH + SIDE_PADDING * 3,
    0,
  );

  const handleContentSizeChange = () => {
    if (hasScrolledToEnd.current) {
      return;
    }

    hasScrolledToEnd.current = true;

    scrollRef.current?.scrollTo({
      x: initialOffset,
      animated: false,
    });
  };

  const selectedPoint = coords[selectedIndex];

  if (sorted.length === 0 || !selectedPoint) {
    return (
      <View style={s.emptyWrap}>
        <Text style={s.emptyLabel}>No data yet</Text>

        <Text style={s.emptyBody}>Values will appear here once recorded.</Text>
      </View>
    );
  }

  const firstDate = startOfDay(sorted[0].date);
  const selectedDate = startOfDay(selectedPoint.date);

  const daysFromFirst =
    Math.round(
      (selectedDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={[s.headlineValue, { color: accentColor }]}>
          {selectedPoint.value.toFixed(decimals)}

          {unit ? <Text style={s.headlineUnit}> {unit}</Text> : null}
        </Text>

        <Text style={[s.change, { color: accentColor }]}>
          Day {daysFromFirst}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={dayWidth}
        decelerationRate="fast"
        directionalLockEnabled
        nestedScrollEnabled
        contentOffset={{
          x: initialOffset,
          y: 0,
        }}
        onContentSizeChange={handleContentSizeChange}
      >
        <View
          style={{
            width: chartAreaWidth,
          }}
        >
          <Svg width={chartAreaWidth} height={CHART_HEIGHT}>
            {[0.25, 0.5, 0.75].map((f, idx) => (
              <Line
                key={idx}
                x1={0}
                x2={chartAreaWidth}
                y1={PADDING_TOP + plotHeight * f}
                y2={PADDING_TOP + plotHeight * f}
                stroke={Colors.SLATE100}
                strokeWidth={1}
              />
            ))}

            {/* DATA LINE */}
            <Path
              d={pathD}
              stroke={accentColor}
              strokeWidth={2.5}
              fill="none"
            />

            {/* DATA POINTS */}
            {coords.map((c, i) => {
              if (c.isInterpolated) {
                return null;
              }

              const isSelected = i === selectedIndex;

              return (
                <G
                  key={c.id}
                  onPress={() => {
                    setSelectedIndex(i);
                    setRefSelected(false);
                    setRefTouchX(null);
                  }}
                >
                  <Circle cx={c.x} cy={c.y} r={18} fill="transparent" />

                  <Circle
                    cx={c.x}
                    cy={c.y}
                    r={isSelected ? 5 : 3}
                    fill={isSelected ? accentColor : Colors.WHITE}
                    stroke={accentColor}
                    strokeWidth={isSelected ? 0 : 2}
                  />

                  {isSelected && (
                    <SvgText
                      x={c.x}
                      y={c.y - 14}
                      fontSize={12}
                      fontWeight="bold"
                      fill={accentColor}
                      textAnchor="middle"
                    >
                      {c.value.toFixed(decimals)}
                    </SvgText>
                  )}
                </G>
              );
            })}

            {/* REFERENCE LINE */}
            {referenceCoords.length > 0 && (
              <>
                <Path
                  d={referenceCoords
                    .map(
                      (point, index) =>
                        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
                    )
                    .join(" ")}
                  stroke={referenceColor}
                  strokeWidth={2}
                  strokeDasharray="8, 6"
                  fill="none"
                />

                {refSelected &&
                  refTouchX !== null &&
                  selectedReferenceValue !== null && (
                    <>
                      <Circle
                        cx={refTouchX}
                        cy={getY(selectedReferenceValue)}
                        r={5}
                        fill={referenceColor}
                      />

                      <SvgText
                        x={refTouchX}
                        y={
                          getY(selectedReferenceValue) < 30
                            ? getY(selectedReferenceValue) + 20
                            : getY(selectedReferenceValue) - 10
                        }
                        fontSize={12}
                        fontWeight="bold"
                        fill={referenceColor}
                        textAnchor="middle"
                      >
                        {referenceLabel}{" "}
                        {selectedReferenceValue.toFixed(decimals)}
                      </SvgText>
                    </>
                  )}

                {referenceCoords.map((point, index) => {
                  if (index === referenceCoords.length - 1) {
                    return null;
                  }

                  const next = referenceCoords[index + 1];

                  const x = Math.min(point.x, next.x);
                  const width = Math.abs(next.x - point.x);

                  const top = Math.min(point.y, next.y) - 25;
                  const height = Math.abs(next.y - point.y) + 50;

                  return (
                    <Rect
                      key={`reference-touch-${index}`}
                      x={x}
                      y={Math.max(0, top)}
                      width={Math.max(width, 1)}
                      height={Math.min(CHART_HEIGHT - Math.max(0, top), height)}
                      fill="transparent"
                      onPress={(event) => {
                        const touchX = event.nativeEvent.locationX;

                        const actualX = x + touchX;

                        const value = getReferenceValueAtX(actualX);

                        if (value === null) {
                          return;
                        }

                        setRefTouchX(actualX);
                        setSelectedReferenceValue(value);
                        setRefSelected(true);
                      }}
                    />
                  );
                })}
              </>
            )}
          </Svg>

          {/* DATE ROW */}
          <View
            style={{
              width: chartAreaWidth,
              flexDirection: "row",
              paddingLeft: SIDE_PADDING + centerOffset,
              paddingRight: SIDE_PADDING,
            }}
          >
            {chartDates.map((c, i) => {
              /*
               * Determine if this date is
               * the currently selected data
               * record.
               */
              const dataIndex = chartData.findIndex(
                (item) => getDateKey(item.date) === getDateKey(c.date),
              );

              return (
                <View
                  key={c.id}
                  style={{
                    width: dayWidth,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={[
                      s.dateLabel,
                      dataIndex === selectedIndex && [
                        s.dateLabelActive,
                        { color: accentColor },
                      ],
                    ]}
                  >
                    {formatDate(c.date)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function startOfDay(date: Date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function getDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function findPreviousRecord(records: ChartPoint[], date: Date) {
  let previous: ChartPoint | null = null;

  for (const record of records) {
    if (startOfDay(record.date).getTime() < date.getTime()) {
      previous = record;
    } else {
      break;
    }
  }

  return previous;
}

function findNextRecord(records: ChartPoint[], date: Date) {
  for (const record of records) {
    if (startOfDay(record.date).getTime() > date.getTime()) {
      return record;
    }
  }

  return null;
}

function formatDate(d: Date) {
  const day = d.getDate().toString().padStart(2, "0");

  const month = (d.getMonth() + 1).toString().padStart(2, "0");

  return `${month}-${day}`;
}

const s = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },

  header: {
    paddingHorizontal: 16,
    marginBottom: 6,
  },

  headlineValue: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  headlineUnit: {
    fontSize: 14,
    fontWeight: "700",
  },

  change: {
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: 2,
  },

  dateLabel: {
    color: Colors.SLATE500,
    fontSize: 9,
    fontWeight: "500",
    marginTop: 6,
  },

  dateLabelActive: {
    fontWeight: "800",
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },

  emptyLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: Colors.SLATE700,
    marginBottom: 4,
  },

  emptyBody: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.SLATE500,
    textAlign: "center",
    lineHeight: 17,
  },
});
