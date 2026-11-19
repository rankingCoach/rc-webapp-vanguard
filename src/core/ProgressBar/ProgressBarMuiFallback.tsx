// Plan §36.2 B.3: the MUI LinearProgress route (variant buffer / query, unreachable in rc-webapp) as the default
// export of its own module, so ProgressBar loads it lazily and its eager import graph stays free of @mui/*. The
// `…Fallback` file name lets the WordPress build inline it (config/inline-mui-fallbacks.ts).
export { ProgressBarMui as default } from './ProgressBarMui';
