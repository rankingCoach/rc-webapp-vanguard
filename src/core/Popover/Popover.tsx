import { useWindowResize } from '@custom-hooks/use-window.resize';
import { uuidv4 } from '@helpers/generate-uid';
import { Tooltip } from '@mui/material';
import { TooltipClasses } from '@mui/material/Tooltip/tooltipClasses';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import { PopoverPopper } from '@vanguard/Popover/PopoverPopper/PopoverPopper';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React, { useEffect, useRef, useState } from 'react';

export type PopoverTheme = 'default' | 'dark';
export type PopoverPosition = 'bottom' | 'top' | 'left' | 'right';

export interface PopoverProps {
  children: React.ReactElement;
  message?: string | React.ReactNode;
  title?: string | React.ReactNode;
  position?: PopoverPosition;
  maxWidth?: string; // Recommended to not specify, since Popover has a fancy width automation
  arrow?: boolean; // Setting to false will hide the arrow
  wrapChildren?: boolean; // Adds a span wrapper to children (solves ForwardRef issue with custom components)
  interactive?: boolean; // Adds a onLeave delay, so user may hover the Popover (tg. to click on links on it)
  theme?: PopoverTheme;
  replacements?: TextReplacements;
  className?: Partial<TooltipClasses>;
  /**
   * The popover does not appear when the window width is below this given parameter
   */
  hideUnderBreakpoint?: number;
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const Popover = (props: PopoverProps) => {
  const {
    children,
    message,
    title,
    position = 'top',
    arrow = true,
    wrapChildren = true,
    maxWidth,
    interactive = false,
    replacements,
    theme = 'dark',
    hideUnderBreakpoint,
    className,
  } = props;

  const width = useWindowResize();
  const [popoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  /**
   * Tooltip popper stacking
   * -------
   * MUI's Tooltip portals to <body> with no z-index, so inside a stacked
   * modal/drawer it paints *behind* the surface that opened it. Register a
   * 'popover' slot on open and release it on close — same pattern as the
   * Select dropdown in InputBase.
   */
  const popperIdRef = useRef<string>(`popover-popper-${uuidv4()}`);
  const [popperZIndex, setPopperZIndex] = useState(OVERLAY_BASE_Z_INDEX);

  const openPopover = () => {
    setPopperZIndex(OverlayStackingService.register(popperIdRef.current, 'popover'));
    setIsPopoverOpen(true);
  };
  const closePopover = () => {
    OverlayStackingService.unregister(popperIdRef.current);
    setPopperZIndex(OVERLAY_BASE_Z_INDEX);
    setIsPopoverOpen(false);
  };
  // Release the slot if the popover unmounts while still open.
  useEffect(() => () => OverlayStackingService.unregister(popperIdRef.current), []);

  useEffect(() => {
    if (hideUnderBreakpoint && width < hideUnderBreakpoint) {
      closePopover();
    }
  }, []);
  /**
   * Do not apply popover, if no message
   */
  if (!message) {
    return children;
  }

  /**
   * Function: Get Title
   */
  function getTitle() {
    if (typeof message === 'string') {
      return (
        <>
          <Render if={!!title && typeof title === 'string'}>
            <Text replacements={replacements} fontWeight={FontWeights.bold}>
              {title}
            </Text>
          </Render>
          <Text type={TextTypes.textHelp} replacements={replacements}>
            {message}
          </Text>
        </>
      );
    }
    return message ?? '';
  }

  /**
   * Function: Render Children
   */
  function renderChildren() {
    if (wrapChildren) {
      return <span key={1}>{children}</span>;
    }
    return children;
  }

  /**
   * Return View
   * ---
   */
  return (
    <Tooltip
      title={getTitle()}
      arrow={arrow}
      placement={position}
      PopperComponent={PopoverPopper}
      open={popoverOpen}
      classes={className}
      PopperProps={{
        // Override MUI's static tooltip z-index so the popper stacks above
        // any modal/drawer it was opened from (see OverlayStackingService).
        style: { maxWidth: maxWidth, zIndex: popperZIndex },
        className: theme === 'dark' ? 'MuiTooltip-popper-dark' : '',
        placement: position,
      }}
      disableInteractive={!interactive}
      componentsProps={{
        tooltip: {
          style: { maxWidth: maxWidth },
        },
      }}
      onMouseEnter={() => {
        if (hideUnderBreakpoint && width < hideUnderBreakpoint) {
          closePopover();
          return;
        }
        openPopover();
      }}
      onMouseLeave={() => {
        closePopover();
      }}
    >
      {renderChildren()}
    </Tooltip>
  );
};
