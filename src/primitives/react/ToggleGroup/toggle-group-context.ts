import { createContext, useContext } from 'react';

/** Group → button wiring (the same props MUI's ToggleButtonGroup context provided). */
export interface ToggleGroupContextValue {
  value: any;
  onChange: (event: React.MouseEvent<HTMLElement>, value: any) => void;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  groupedClassName: string;
  /** Consumer `classes.firstButton/middleButton/lastButton`, appended to the position class. */
  positionClassNames?: Partial<Record<'first' | 'middle' | 'last', string>>;
}

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);
/** Position of the direct child that rendered a button: '' (alone), first, middle or last. */
export const ToggleGroupPositionContext = createContext<'' | 'first' | 'middle' | 'last'>('');

export const useToggleGroup = () => useContext(ToggleGroupContext);
export const useToggleGroupPosition = () => useContext(ToggleGroupPositionContext);
