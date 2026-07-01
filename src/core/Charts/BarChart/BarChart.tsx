import './BarChart.scss';

import { CHART_COLORS } from '@helpers/charts/colors';
import { resolveCssVariables } from '@helpers/resolve-css-variables';
import { translationService } from '@services/translation.service';
import { BigLegendItem } from '@vanguard/Charts/BigLegend/BigLegendItem/BigLegendItem';
import { ChartsPlaceholder } from '@vanguard/Charts/ChartsPlaceholder/ChartsPlaceholder';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Render } from '@vanguard/Render/Render';
import { TextReplacements } from '@vanguard/Text/Text';
import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { renderToString } from 'react-dom/server';

/**
 * Types
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type BarChartSeries = {
  name: string;
  data: number[];
};

/**
 * Props
 * ---------------------------------------------------------------------------------------------------------------------
 */
export interface BarChartProps {
  series: BarChartSeries[];
  categories: string[];
  colors?: string[];
  showLegend: boolean;
  chartTitle?: string | React.ReactNode;
  replacements?: TextReplacements;
  customLegendItems: string[];
  legendFillColors?: string[];
  height?: string;
  width?: string;
  containerWidth?: string;
  legendFormatter?: (legendName: string, opts?: any) => string;
  testId?: string;
  isLoading?: boolean;
  distributed?: boolean;
  columnWidth?: string;
  showBigLegend?: boolean;
  yAxisDataFormatter?: (value: number, index: any) => string;
  showPercentage?: boolean;
  showYaxis?: boolean;
  showGrid?: boolean;
  customTooltipFormatter?: (category: string, value: number, dataPointIndex: number) => string | React.ReactNode;
}

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const BarChart = (props: BarChartProps) => {
  const {
    series,
    categories,
    customLegendItems,
    colors = CHART_COLORS,
    chartTitle,
    replacements,
    showLegend,
    legendFillColors = CHART_COLORS,
    legendFormatter,
    height = '256px',
    width = '100%',
    containerWidth,
    testId,
    isLoading,
    distributed = true,
    columnWidth = '95%',
    showBigLegend = true,
    showPercentage = false,
    yAxisDataFormatter,
    showYaxis = true,
    showGrid = true,
    customTooltipFormatter,
  } = props;

  // Resolve CSS variables to actual color values for ApexCharts compatibility
  const resolvedColors = React.useMemo(() => resolveCssVariables(colors), [colors]);
  const resolvedLegendFillColors = React.useMemo(() => resolveCssVariables(legendFillColors), [legendFillColors]);

  /**
   * Format data
   * -------------------------------------------------------------------------------------------------------------------
   */
  const getCategories = (categories: string[]): string[] => {
    return categories.map((item) => {
      item = translationService.get(item).value;
      return item;
    });
  };

  const getCustomLegendItems = (customLegendItems: string[]): string[] => {
    return customLegendItems.map((item) => {
      item = translationService.get(item).value;
      return item;
    });
  };

  /**
   * Function | Calculate Total Series
   * -------------------------------------------------------------------------------------------------------------------
   */
  const getTotalSeriesValues = (series: BarChartSeries[]) => {
    let total: number = 0;
    series.forEach((element, index) => {
      element.data.forEach((item) => {
        total += item;
      });
    });
    return total;
  };

  /**
   * Options
   * -------------------------------------------------------------------------------------------------------------------
   */
  const options: ApexOptions = {
    colors: resolvedColors,
    chart: {
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        distributed: distributed,
        horizontal: false,
        columnWidth: columnWidth,
        borderRadius: 8,
        barHeight: '80%',
      },
    },
    xaxis: {
      type: 'category',
      axisBorder: {
        show: false,
      },
      categories: getCategories(categories),
      labels: {
        show: true,
        style: {
          fontSize: '12px',
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      show: showYaxis,
      axisBorder: {
        show: true,
      },
      opposite: true,
      labels: {
        show: true,
        style: {
          fontSize: '12px',
          fontFamily: 'var(--theme-typeface)',
          fontWeight: 400,
        },
        ...(yAxisDataFormatter
          ? {
              formatter: function (val, index) {
                return yAxisDataFormatter(val, index);
              },
            }
          : {}),
      },
    },
    legend: {
      show: showLegend,
      position: 'top',
      fontSize: '12px',
      fontFamily: 'var(--theme-typeface)',
      fontWeight: 400,
      horizontalAlign: 'right',
      markers: {
        width: 12,
        height: 12,
        radius: 10,
        fillColors: resolvedLegendFillColors,
      },
      labels: {
        colors: 'var(--n700)',
      },
      customLegendItems: getCustomLegendItems(customLegendItems),
      ...(legendFormatter
        ? {
            formatter: function (seriesName, opts) {
              return legendFormatter(seriesName, opts);
            },
          }
        : {}),
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: showGrid,
      borderColor: 'rgba(var(--fn-fg-rgb), 0.1)',
      strokeDashArray: 6,
      position: 'back',
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: 'light',
      custom: ({ series, dataPointIndex, w }) => {
        if (customTooltipFormatter) {
          const category = w.config.xaxis.categories[dataPointIndex];
          const value = series[0][dataPointIndex];
          const customContent = customTooltipFormatter(category, value, dataPointIndex);

          // Handle React.ReactNode by converting to HTML string
          const contentHtml =
            typeof customContent === 'string'
              ? customContent
              : React.isValidElement(customContent)
                ? renderToString(customContent)
                : String(customContent);

          return `<div class="tooltip custom-tooltip">${contentHtml}</div>`;
        }

        let dataList: string = '';
        series.forEach((element: BarChartSeries[], index: number) => {
          dataList += `<div class="tooltip-row">
            <div class="tooltip-color" style="background-color: ${
              distributed
                ? w.config.colors
                  ? w.config.colors[dataPointIndex]
                  : w.globals.colors[dataPointIndex]
                : w.config.colors
                  ? w.config.colors[index]
                  : w.globals.colors[index]
            }"></div>
            <span class="tooltip-text">${w.config.series[index].name ? w.config.series[index].name : ''}</span>
            <span class="tooltip-number">${element[dataPointIndex]}${showPercentage ? '%' : ''}</span>
        </div>`;
        });
        return `<div class="tooltip">${dataList}</div>`;
      },
    },
  };

  /**
   * Return view
   * -------------------------------------------------------------------------------------------------------------------
   */
  return (
    <ComponentContainer testId={testId} className={'barChart-container'} style={{ width: containerWidth }}>
      <Render if={isLoading}>
        <ChartsPlaceholder />
      </Render>

      <Render if={showBigLegend}>
        <div className={'barChart-header'}>
          <BigLegendItem
            roundNumbers={true}
            currentNumber={getTotalSeriesValues(series)}
            topTitle={chartTitle}
            replacements={replacements}
          />
        </div>
      </Render>

      <ReactApexChart type="bar" options={options} series={series} width={width} height={height} />
    </ComponentContainer>
  );
};
