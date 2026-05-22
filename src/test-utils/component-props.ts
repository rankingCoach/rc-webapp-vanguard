// Minimal prop stubs for components that crash with empty props.
// Shared between perf and stress harnesses.
/* eslint-disable @typescript-eslint/no-explicit-any */

const noop = () => {};

export const COMPONENT_PROPS: Record<string, Record<string, unknown>> = {
  Autocomplete: { options: [], value: '', onChange: noop },
  BenchmarkGauge: { min: 0, max: 100, markers: [] },
  CustomDrawers: { options: [], value: [], title: '', onSave: noop, onClose: noop },
  Documents: { items: [], documents: [], files: [] },
  FadeCarouselAuto: { items: [], children: () => null, renderItem: () => null },
  FadedCarousel: { items: [], children: [] },
  List: { listElements: [], type: 'none' },
  RadioButtonGroup: { value: '', options: [], name: 'perf', setRadioValueFn: noop },
  RelativeTime: { children: new Date() },
  SearchableSelect: { options: [], value: '', onChange: noop },
  SlideTransition: { children: [null, null] },
  Table: { data: { columns: [{ alias: 'a', text: '' }], rows: [] } },
  Tabs: { tabs: [], value: 0, onChange: noop },
  TogglerWithText: {
    left: { component: null },
    right: { component: null },
    togglerState: 'left',
  },
  VideoPlayer: { opts: { src: '' } },
};
