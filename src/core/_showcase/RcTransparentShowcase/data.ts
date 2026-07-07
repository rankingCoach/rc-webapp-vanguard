// Hand-picked visual-inspection set for the rgba(var(--token-rgb), a) →
// rc_transparent(--token, a) / color-mix() migration. Each record embeds the
// component's existing Storybook story and lists the exact style lines that
// changed, so a reviewer can compare the rendered result against master.

export type RcTransparentChange = {
  before: string;
  after: string;
};

export type RcTransparentRecord = {
  title: string;
  path: string;
  /** What to look at when visually inspecting the embedded story. */
  inspect: string;
  changes: RcTransparentChange[];
  storyId: string;
};

export const rcTransparentRecords: RcTransparentRecord[] = [
  {
    title: 'Button (disabled states)',
    path: 'src/core/Button/_button-props.scss',
    inspect: 'Disabled default/secondary buttons: text at 50% opacity, disabled background at 50%, ripple color.',
    changes: [
      {
        before: 'background-color: rgba(var($hexcolor), $opacity);',
        after: 'background-color: rc_transparent($hexcolor, $opacity);',
      },
      {
        before: 'color: rgba(var(--_button-default-disabled-text-color-rgb), 0.5);',
        after: 'color: color-mix(in srgb, var(--_button-default-disabled-text-color) 50%, transparent);',
      },
    ],
    storyId: 'button-button--button-type-default',
  },
  {
    title: 'Modal',
    path: 'src/core/Modal/Modal.scss + ModalRoot.scss',
    inspect: 'Dialog shadow (three layered --shadow-* custom properties) and the dimmed page backdrop.',
    changes: [
      {
        before: '--shadow-small: 0 1px 3px 0 rgba(var(--fn-shadow-rgb), 0.1), 0 1px 2px 0 rgba(var(--fn-shadow-rgb), 0.06);',
        after: '--shadow-small: 0 1px 3px 0 #{rc_transparent(--fn-shadow, 0.1)}, 0 1px 2px 0 #{rc_transparent(--fn-shadow, 0.06)};',
      },
      {
        before: 'background-color: rgba(var(--fn-shadow-rgb), 0.4);',
        after: 'background-color: rc_transparent(--fn-shadow, 0.4);',
      },
    ],
    storyId: 'modal-modal--modal-story',
  },
  {
    title: 'DropdownMenu',
    path: 'src/core/DropdownMenu/DropdownMenu.module.scss',
    inspect: 'Menu panel drop-shadows (three stacked drop-shadow() filters) and the arrow shadow.',
    changes: [
      {
        before: 'filter: drop-shadow(0px 12px 40px rgba(var(--fn-shadow-rgb), 0.025)) drop-shadow(0px 8px 14px rgba(var(--fn-shadow-rgb), 0.05)) …;',
        after: 'filter: drop-shadow(0px 12px 40px rc_transparent(--fn-shadow, 0.025)) drop-shadow(0px 8px 14px rc_transparent(--fn-shadow, 0.05)) …;',
      },
    ],
    storyId: 'dropdownmenu-dropdownmenu--default',
  },
  {
    title: 'Switch (checked)',
    path: 'src/core/Switch/Switch.scss',
    inspect: 'Checked knob: four layered CTA-tinted shadows plus the 6px focus/active halo ring.',
    changes: [
      {
        before: 'box-shadow: 0px -2px 4px rgba(var(--fn-bg-cta-rgb), 0.1), 0px 8px 16px rgba(var(--fn-bg-cta-rgb), 0.2), …;',
        after: 'box-shadow: 0px -2px 4px rc_transparent(--fn-bg-cta, 0.1), 0px 8px 16px rc_transparent(--fn-bg-cta, 0.2), …;',
      },
      {
        before: 'box-shadow: 1px 0 0 6px rgba(var(--fn-bg-cta-rgb), 0.2);',
        after: 'box-shadow: 1px 0 0 6px rc_transparent(--fn-bg-cta, 0.2);',
      },
    ],
    storyId: 'switch-switch--switch-checked',
  },
  {
    title: 'Slider',
    path: 'src/core/Slider/Slider.scss',
    inspect: 'Thumb shadow stack, hover halo on the handle (0.15 glow), and the arrow drop-shadow.',
    changes: [
      {
        before: 'box-shadow: 0 8px 24px rgba(var(--fn-shadow-rgb), 0.03), 0 4px 8px rgba(var(--fn-shadow-rgb), 0.05), …;',
        after: 'box-shadow: 0 8px 24px rc_transparent(--fn-shadow, 0.03), 0 4px 8px rc_transparent(--fn-shadow, 0.05), …;',
      },
      {
        before: 'background-color: rgba(var(--fn-bg-hov-n-gl-rgb), 0.15);',
        after: 'background-color: rc_transparent(--fn-bg-hov-n-gl, 0.15);',
      },
    ],
    storyId: 'slider-slider--default',
  },
  {
    title: 'DateRangePicker',
    path: 'src/core/DateRangePicker/DateRangePicker.scss',
    inspect: 'Calendar panel shadow, day-cell hover circle (0.15), and the in-range day background (0.09).',
    changes: [
      {
        before: 'background: rgba(var(--fn-bg-rgb), 0.09);',
        after: 'background: rc_transparent(--fn-bg, 0.09);',
      },
      {
        before: 'background-color: rgba(var(--fn-bg-hov-n-gl-rgb), 0.15);',
        after: 'background-color: rc_transparent(--fn-bg-hov-n-gl, 0.15);',
      },
    ],
    storyId: 'daterangepicker-daterangepicker--default',
  },
  {
    title: 'Table (scroll edge)',
    path: 'src/core/Table/TableCell.module.scss + TableHeader.module.scss',
    inspect: 'Horizontal-scroll edge: the four-stop shadow gradient on sticky cells (scroll the table sideways).',
    changes: [
      {
        before: 'background: linear-gradient(to right, rgba(var(--fn-shadow-rgb), 0.225) 0, …, rgba(var(--fn-shadow-rgb), 0) 100%);',
        after: 'background: linear-gradient(to right, rc_transparent(--fn-shadow, 0.225) 0, …, rc_transparent(--fn-shadow, 0) 100%);',
      },
    ],
    storyId: 'table-table--default',
  },
  {
    title: 'TagList / Tag',
    path: 'src/core/TagList/Tag/Tag.scss',
    inspect: 'Tag backgrounds: success tint at 8% and neutral hover tint at 16% (percent alphas, not 0..1).',
    changes: [
      {
        before: 'background-color: rgba(var(--s400-rgb), 8%);',
        after: 'background-color: rc_transparent(--s400, 8%);',
      },
      {
        before: 'background-color: rgba(var(--fn-bg-hov-n-gl-rgb), 16%);',
        after: 'background-color: rc_transparent(--fn-bg-hov-n-gl, 16%);',
      },
    ],
    storyId: 'taglist-taglist--different-types',
  },
  {
    title: 'RadioButton',
    path: 'src/core/RadioButton/RadioButton.scss',
    inspect: 'Hover halo on the checked radio: success-tinted ring at 15%.',
    changes: [
      {
        before: 'background: rgba(var(--s500-rgb), 0.15);',
        after: 'background: rc_transparent(--s500, 0.15);',
      },
    ],
    storyId: 'radiobutton-radiobutton--default',
  },
  {
    title: 'Text (highlight)',
    path: 'src/core/Text/Text.scss + highlight stories',
    inspect: 'Highlighted words: warning/error background at 40% (story prop) and the .highlight tints at 20% (scss).',
    changes: [
      {
        before: 'background: rgba(var(--e500-rgb), 0.2);',
        after: 'background: rc_transparent(--e500, 0.2);',
      },
      {
        before: "highlightColor: 'rgba(var(--w400-rgb),0.4)'",
        after: "highlightColor: 'color-mix(in srgb, var(--w400) 40%, transparent)'",
      },
    ],
    storyId: 'text-stories-text-highlight--highlight-with-emphasis',
  },
  {
    title: 'Loader',
    path: 'src/core/Loader/Loader.scss',
    inspect: 'The dimmed overlay behind the spinner: shadow tint at 50%.',
    changes: [
      {
        before: 'background-color: rgba(var(--fn-shadow-rgb), 0.5);',
        after: 'background-color: rc_transparent(--fn-shadow, 0.5);',
      },
    ],
    storyId: 'loader-loader--in-container',
  },
  {
    title: 'GalleryMediaItem',
    path: 'src/core/Gallery/Gallery/GalleryMediaItem/GalleryMediaItem.module.scss',
    inspect: 'Hover overlay (60% shadow), CTA-tinted selection layer (30%), and the bottom caption gradient.',
    changes: [
      {
        before: 'background-color: rgba(var(--fn-shadow-rgb), 0.6);',
        after: 'background-color: rc_transparent(--fn-shadow, 0.6);',
      },
      {
        before: 'background: linear-gradient(180deg, rgba(var(--fn-fg-rgb), 0) 0%, var(--fn-bg-dark) 126.79%);',
        after: 'background: linear-gradient(180deg, rc_transparent(--fn-fg, 0) 0%, var(--fn-bg-dark) 126.79%);',
      },
    ],
    storyId: 'gallery-gallery-gallerymediaitem-gallerymediaitem--image',
  },
  {
    title: 'FadedCarousel',
    path: 'src/core/FadedCarousel/FadedCarousel.module.scss + FadedCarousel.tsx',
    inspect: 'Left/right fade masks (gradient to 0% alpha), arrow buttons: border at 70% and hover fill (TS string).',
    changes: [
      {
        before: 'background: linear-gradient(90deg, var(--fn-bg) 50.33%, rgba(var(--fn-bg-rgb), 0) 100%);',
        after: 'background: linear-gradient(90deg, var(--fn-bg) 50.33%, rc_transparent(--fn-bg, 0) 100%);',
      },
      {
        before: "fillColor={arrows?.color ?? 'rgba(var(--fn-fg-rgb), 0.7)'}",
        after: "fillColor={arrows?.color ?? 'color-mix(in srgb, var(--fn-fg) 70%, transparent)'}",
      },
    ],
    storyId: 'fadedcarousel-fadedcarousel--default',
  },
  {
    title: 'FrostedGlass',
    path: 'src/core/FrostedGlass/FrostedGlass.module.scss',
    inspect: 'The frost layer itself: page background at 30% over the blurred content.',
    changes: [
      {
        before: 'background-color: rgba(var(--fn-bg-rgb), 0.3);',
        after: 'background-color: rc_transparent(--fn-bg, 0.3);',
      },
    ],
    storyId: 'frostedglass-frostedglass--default',
  },
  {
    title: 'CardMotion (glow-in)',
    path: 'src/core/CardMotion/CardMotion.module.scss',
    inspect: 'The glow-in keyframe: background/shadow alphas driven by a CSS variable via calc() — watch the entrance animation.',
    changes: [
      {
        before: 'background: rgba(var(--fn-bg-rgb), var(--card-motion-glow-alpha-from));',
        after: 'background: color-mix(in srgb, var(--fn-bg) calc(var(--card-motion-glow-alpha-from) * 100%), transparent);',
      },
      {
        before: '… rgba(var(--fn-shadow-rgb), calc(0.55 * var(--card-motion-glow-alpha-from)));',
        after: '… color-mix(in srgb, var(--fn-shadow) calc(0.55 * var(--card-motion-glow-alpha-from) * 100%), transparent);',
      },
    ],
    storyId: 'cardmotion-cardmotion--glow-in',
  },
];
