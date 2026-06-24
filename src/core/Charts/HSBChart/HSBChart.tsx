import './HSBChart.scss';

import { abbreviateNumber } from '@helpers/round-number';
import { translationService } from '@services/translation.service';
import { BigLegend } from '@vanguard/Charts/BigLegend/BigLegend';
import { BigLegendItemProps } from '@vanguard/Charts/BigLegend/BigLegendItem/BigLegendItem';
import { ChartsPlaceholder } from '@vanguard/Charts/ChartsPlaceholder/ChartsPlaceholder';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Render } from '@vanguard/Render/Render';
import { ApexOptions } from 'apexcharts';
import React, { ReactNode } from 'react';
import ReactApexChart from 'react-apexcharts';

/**
 * Types
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type RenderBigLegendFnType = (HSBChartProps: Omit<HSBChartProps, 'renderBigLegendFn'>) => ReactNode;

export type HSBChartSeries =
  | {
      name: string;
      data: number[];
      color?: string;
    }
  | {
      name: string;
      data: {
        x: string;
        y: number;
      }[];
      color?: string;
    };

export type HSBChartProps = {
  series: HSBChartSeries[];
  categories: string[];
  height?: string;
  previousSeries?: HSBChartSeries[];
  showBigLegend?: boolean;
  renderBigLegendFn?: RenderBigLegendFnType;
  testId?: string;
  isLoading?: boolean;
  showLegend?: boolean;
  isStacked?: boolean;
  hasPercentageXaxis?: boolean;
};

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const HSBChart = (props: HSBChartProps) => {
  const {
    series,
    categories,
    height = '250px',
    showBigLegend,
    renderBigLegendFn,
    testId = 'HSBChart_TestId',
    isLoading,
    showLegend,
    isStacked = true,
    hasPercentageXaxis = false,
  } = props;

  /**
   * Format data
   */
  const getSeries = (series: HSBChartSeries[]): HSBChartSeries[] => {
    return series.map((item) => {
      item.name = translationService.get(item.name).value;
      return item;
    });
  };

  const getCategories = (categories: string[]): string[] => {
    return categories.map((item) => {
      item = translationService.get(item).value;
      return item;
    });
  };

  const makeRoundedCorner = (series: HSBChartSeries[]) => {
    let borderRadius: number[] = [];
    let isRounded: boolean = false;
    series.map((series) => {
      if (series.data[0] == 0) {
        isRounded = true;
      }
    });
    if (series.length === 1 || isRounded) {
      borderRadius = [8, 8];
    } else {
      borderRadius = [0, 8];
    }
    return borderRadius;
  };
  /**
   * Get Big Legend Data
   */
  const renderBigLegend = (hsbChartProps: HSBChartProps = props) => {
    if (renderBigLegendFn) {
      return renderBigLegendFn(hsbChartProps);
    }

    const getCustomBigLegendData = (series: HSBChartSeries[]): BigLegendItemProps[] => {
      const bigLegendData: BigLegendItemProps[] = [];
      series.forEach((value) => {
        if (typeof value.data[0] === 'object') {
          value.data.map((el) => {
            const elAsObject = el as { x: string; y: number };
            // Case when data is an array of objects
            bigLegendData.push({
              title: value.name,
              currentNumber: elAsObject.y as number,
            });
          });
        } else {
          // Case when data is an array of numbers
          bigLegendData.push({
            title: value.name,
            currentNumber: value.data[0] as number,
          });
        }
      });
      return bigLegendData;
    };

    return (
      <BigLegend
        bigLegendData={getCustomBigLegendData(hsbChartProps.series)}
        testId={`${hsbChartProps.testId}_BigLegend`}
      />
    );
  };

  /**
   * Options
   */
  const options: ApexOptions = {
    chart: {
      stacked: isStacked,
      stackType: '100%',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '100%',
        borderRadius: isStacked ? makeRoundedCorner(series) : 4,
        barHeight: '80%',
      },
    },
    stroke: {
      width: 0,
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
        formatter(value: string): string | string[] {
          return hasPercentageXaxis ? `${value}%` : abbreviateNumber(parseInt(value));
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      axisBorder: {
        show: true,
      },
      labels: {
        show: true,
        style: {
          fontSize: '12px',
          fontFamily: 'Roboto',
          fontWeight: 400,
        },
      },
    },
    legend: {
      show: showLegend,
      showForSingleSeries: true,
      position: 'bottom',
      fontSize: '12px',
      fontFamily: 'Roboto',
      fontWeight: 400,
      markers: {
        width: 15,
        height: 15,
        radius: 10,
      },
      labels: {
        colors: 'var(--n700)',
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: true,
      borderColor: 'rgba(var(--fn-fg-rgb), 0.2)',
      strokeDashArray: 6,
      position: 'front',
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
    tooltip: {
      enabled: true,
      theme: 'dark',
      custom: ({ series, dataPointIndex, w }) => {
        let dataList: string = '';
        series.forEach((element: HSBChartSeries[], index: number) => {
          const percentageSuffix = hasPercentageXaxis ? '%' : '';
          dataList += `<div class="tooltip-row">
            <div class="tooltip-color" style="background-color: ${w.config.series[index].color}"></div>
            <span class="tooltip-text-name">${w.config.series[index].name}</span>
            <span class="tooltip-number">${element[dataPointIndex]}${percentageSuffix}</span>
        </div>`;
        });
        return `<div class="tooltip"><p class="tooltip-title">${w.globals.labels[dataPointIndex]}</p>${dataList}</div>`;
      },
    },
  };

  /**
   * Return view
   * ---
   */
  return (
    <ComponentContainer className={'hsb-chart-container'} testId={testId}>
      <Render if={isLoading}>
        <ChartsPlaceholder />
      </Render>

      {showBigLegend && renderBigLegend(props)}
      <ReactApexChart type="bar" options={options} series={getSeries(series)} width={'100%'} height={height} />
    </ComponentContainer>
  );
};
