import { CHART_COLORS } from '@helpers/charts/colors';
import { parseCssVariable } from '@helpers/css-variables-parser';
import { deviceService } from '@services/device.service';
import { translationService } from '@services/translation.service';
import { LineChartBaseProps, lineChartBaseSeriesType } from '@vanguard/Charts/LineChart/LineChart';
import { useGetTotalSeriesValues } from '@vanguard/Charts/LineChart/use-get-total-series-values';
import { ApexOptions } from 'apexcharts';
import moment from 'moment';
import { useEffect, useState } from 'react';

const XAXIS_MIN_TICKS = 8;

export const useLineChartOptions = (opts: LineChartBaseProps) => {
  const {
    labels,
    customLegendItems,
    showLegend = true,
    replacements,
    colors = CHART_COLORS,
    series,
    previousSeries,
    yaxisMin,
    yaxisMax,
    yaxisTickAmount,
    options,
  } = opts;

  const getTotalSeriesValues = useGetTotalSeriesValues(series, previousSeries);

  const getBigNumbersConverted = (numbersArray: number[] | string[]) => {
    const numbersConverted: string[] = [];
    numbersArray.forEach((element: number | string, index: number) => {
      if (element.toString().length > 3) {
        numbersConverted[index] = `${element.toString().slice(0, 1)},${element.toString().slice(1, 3)} K`;
      } else {
        numbersConverted[index] = `${element}`;
      }
    });
    return numbersConverted;
  };

  /**
   * Get Data in Apex Chart format
   */
  const getColors = (colors: string[]): string[] | undefined => {
    return colors.map((color) => {
      return parseCssVariable(color);
    });
  };

  /**
   * Get X Axis Tick Amount
   */
  const getXAxisTickAmount = () => {
    const seriesLength = series?.[0]?.data?.length ?? 0;

    const isMobile = deviceService.isMobile();

    if (seriesLength > 30) return XAXIS_MIN_TICKS;
    if (isMobile && seriesLength > 7) return XAXIS_MIN_TICKS;

    return 'dataPoints'; // show all for short intervals
  };

  /**
   * Options
   */
  const getApexChartOptions = (series: lineChartBaseSeriesType[]): ApexOptions => {
    return {
      ...(colors ? { colors: getColors(colors) } : {}), // Colors for the chart’s series.
      labels: labels ?? [],
      chart: {
        id: 'rcLineChart',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      tooltip: {
        enabled: true,
        enabledOnSeries: undefined,
        shared: true,
        followCursor: true,
        intersect: false,
        inverseOrder: false,
        marker: {
          show: true,
        },
        items: {
          display: 'flex',
        },
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          let label = new Date(w.config.series[0].data[dataPointIndex][0]).toLocaleDateString();

          if (opts.tooltipDateFormatter) {
            label = opts.tooltipDateFormatter(new Date(w.config.series[0].data[dataPointIndex][0]));
          }

          if (w.config.labels && w.config.labels[dataPointIndex] != undefined) {
            label = w.config.labels[dataPointIndex];
          }
          let dataList: string = '';
          series.forEach((element: lineChartBaseSeriesType[], index: number) => {
            dataList += `<div class="rcLineChart-tooltip-row">
                <div class="rcLineChart-tooltip-color" style="background-color: ${
                  w.config.colors ? w.config.colors[index] : w.globals.colors[index]
                }"></div>
                <span>${w.config.series[index].name}</span>
                <span class="rcLineChart-tooltip-row-number">${
                  element[dataPointIndex] == null ? 'no data' : element[dataPointIndex]
                }</span>
            </div>`;
          });
          return `<div class="rcLineChart-tooltip"><p class="rcLineChart-tooltip-title">${label}</p>${dataList}</div>`;
        },
      },
      legend: {
        showForSingleSeries: true,
        show: showLegend,
        position: 'top',
        horizontalAlign: deviceService.isMobile() ? 'left' : 'right',
        floating: false,
        fontSize: '12px',
        fontFamily: 'Roboto',
        fontWeight: 400,
        formatter: (seriesName, opts) => {
          if (customLegendItems) {
            return `${
              translationService.get(customLegendItems[opts.seriesIndex][0], replacements).value
            }<br><span data-testid="legendTotalValue${opts.seriesIndex}" class="totalValue">${
              translationService.get(customLegendItems[opts.seriesIndex][1], replacements).value
            }</span>`;
          } else {
            return `${seriesName}<br><span data-testid="legendTotalValue${opts.seriesIndex}" class="totalValue">${
              getBigNumbersConverted(getTotalSeriesValues(series))[opts.seriesIndex]
            }</span>`;
          }
        },
        inverseOrder: false,
        markers: {
          width: 12,
          height: 12,
          radius: 12,
        },
        onItemClick: {
          toggleDataSeries: false,
        },
      },
      xaxis: {
        type: 'datetime',
        tickAmount: getXAxisTickAmount(),
        position: 'bottom',
        axisTicks: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
        crosshairs: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: 'rgba(var(--fn-fg-rgb), 0.2)', // todo: replace with variable
        },
        labels: {
          offsetX: 5,
          showDuplicates: false,
          formatter: (value, timestamp) => {
            // `value` is the string or numeric value
            // `timestamp` is the numeric time in ms
            if (opts.labelDateFormatter) {
              if (!timestamp || timestamp < 1000000000) return ''; // Skip invalid or Unix epoch start
              return opts.labelDateFormatter(new Date(timestamp));
            } else {
              return moment(timestamp).format('DD MMM');
            }
          },
        },
      },
      grid: {
        show: true,
        borderColor: 'rgba(var(--fn-fg-rgb), 0.2)', // todo: replace with variable
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
      yaxis: {
        opposite: true,
        tickAmount: yaxisTickAmount ? yaxisTickAmount : 4,
        ...(yaxisMin ? { min: yaxisMin } : {}),
        ...(yaxisMax ? { max: yaxisMax } : {}),
      },
      markers: {
        size: 5,
        hover: {
          size: 6,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      ...options,
    };
  };
  const [lineChartOptions, setLineChartOptions] = useState<ApexOptions>(getApexChartOptions(series));
  const [renderKey, setRenderKey] = useState<number>(0);

  useEffect(() => {
    setLineChartOptions(getApexChartOptions(series));
    setRenderKey((prev) => prev + 1);
  }, [series]);

  return { lineChartOptions, renderKey };
};
