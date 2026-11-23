import { useLazyImage } from '@custom-hooks/useLazyImage';
import { Form } from '@vanguard/Form/Form';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '../../test-utils/test-utils';
import { SectionMissing } from '../common/SectionMissing/SectionMissing';
import { Button, ButtonSizes, ButtonTextColors, ButtonTypes } from '../core/Button/Button';
import { Divider } from '../core/Divider/Divider';
import { DragAndDropFile } from '../core/DragAndDropFile/DragAndDropFile';
import { Gallery } from '../core/Gallery/Gallery/Gallery';
import { IconNames } from '../core/Icon/IconNames';
import { RadioButton } from '../core/RadioButton/RadioButton';
import { TagList } from '../core/TagList/TagList';

vi.mock('@custom-hooks/useLazyImage', () => ({ useLazyImage: vi.fn() }));

/**
 * Track (h), per rewritten template-literal site: for every prop combination the new class attribute equals the
 * former template literal's output with the junk tokens (`false|true|undefined|null|NaN`) and stray whitespace
 * removed — same real tokens, same order, nothing added. The former expressions are inlined here verbatim as
 * reference. Plus the watchdog lock: no Button element's class attribute starts with `icon-` (Button.module.scss
 * `[class^="icon-"]` must not start matching once leading junk tokens are gone).
 */
const JUNK = /^(false|true|undefined|null|NaN)$/;
const clean = (legacy: string) =>
  legacy
    .split(/\s+/)
    .filter((t) => t && !JUNK.test(t))
    .join(' ');
const tokens = (c: string | null | undefined) => (c ?? '').split(' ');

describe('junk class tokens: rewritten template-literal sites', () => {
  it(`Form: \`Form-container \${className}\` → classNames`, () => {
    for (const className of [undefined, '', 'mine', 'a b']) {
      const { container, unmount } = render(
        <Form className={className}>
          <span>x</span>
        </Form>,
      );
      const actual = container.querySelector('.Form-container')?.getAttribute('class');
      const legacy = `Form-container ${className}`;
      expect(actual).toBe(clean(legacy));
      expect(tokens(actual)).toEqual(tokens(clean(legacy)));
      unmount();
    }
  });

  it(`SectionMissing: \`BusinessProfileSectionMissing-container \${className}\` → classNames`, () => {
    for (const className of [undefined, '', 'mine']) {
      const { container, unmount } = render(
        <SectionMissing title="t" description="d" buttonText="b" buttonCallback={() => {}} className={className} />,
      );
      const actual = container.querySelector('[data-slot="section-missing"]')?.getAttribute('class');
      // ComponentContainer may add its own class around the passed one: compare the passed part.
      const legacy = `BusinessProfileSectionMissing-container ${className}`;
      expect(actual).toContain(clean(legacy));
      expect(tokens(actual).filter((t) => JUNK.test(t) || t === '')).toEqual([]);
      unmount();
    }
  });

  it(`RadioButton: label \`RadioButton-label \${labelClassName}\` and the text div template → classNames`, () => {
    for (const theme of ['standard', 'bordered', 'success'] as const)
      for (const checked of [false, true])
        for (const disabled of [undefined, false, true])
          for (const labelClassName of [undefined, '', 'lbl']) {
            const { container, unmount } = render(
              <RadioButton
                inputName="n"
                value="v"
                labelText="Label"
                checked={checked}
                disabled={disabled}
                labelClassName={labelClassName}
                theme={theme}
                onChangeFn={() => {}}
              />,
            );
            const label = container.querySelector('label') as HTMLElement;
            expect(label.getAttribute('class')).toBe(clean(`RadioButton-label ${labelClassName}`));
            const text = label.querySelector('div') as HTMLElement;
            const legacyText = `${theme === 'success' ? 'RadioButton-label-text-success' : 'RadioButton-label-text'} ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`;
            expect(text.getAttribute('class')).toBe(clean(legacyText));
            unmount();
          }
  });
});

describe('junk class tokens: template-literal sites found by the story scan', () => {
  it(`Divider: \`rc-divider \${className}\` → classNames`, () => {
    for (const className of [undefined, '', 'mine']) {
      const { container, unmount } = render(<Divider className={className} />);
      // former default: className = '' → `rc-divider ` (trailing space)
      expect(container.querySelector('[data-slot="divider"]')?.getAttribute('class')).toBe(
        clean(`rc-divider ${className ?? ''}`),
      );
      unmount();
    }
  });

  it(`TagList: classNames(\`TagList-container \${className ?? ''} \${gap}\`) → classNames per token`, () => {
    for (const variant of [undefined, 'tag', 'chip', 'chip-filled'] as const)
      for (const className of [undefined, '', 'mine']) {
        const { container, unmount } = render(<TagList tags={[]} variant={variant} className={className} />);
        const actual = container
          .querySelector('[data-slot="tag-list"], .TagList-container')
          ?.getAttribute('class') as string;
        const tokens = actual.split(' ');
        // Former: one template string → `TagList-container <className or ''> <gap>`; same tokens, same order.
        expect(tokens[0]).toBe('TagList-container');
        if (className) expect(tokens[1]).toBe(className);
        expect(tokens).toHaveLength(className ? 3 : 2);
        expect(actual).not.toMatch(/\s{2,}|^\s|\s$/);
        unmount();
      }
  });

  it(`Gallery: \`gallery-list \${className}\` → classNames`, () => {
    vi.mocked(useLazyImage).mockReturnValue({
      isLazyLoading: false,
      isLazyError: false,
      setIsLazyLoading: vi.fn(),
      setIsLazyError: vi.fn(),
    });
    const item = { objectType: 'MediaItemFile', publicUrl: '/image.png', type: 'video' };
    for (const className of [undefined, '', 'mine']) {
      const { container, unmount } = render(<Gallery mediaItems={[item]} editMode={false} className={className} />);
      expect(container.querySelector('[data-slot="gallery"]')?.getAttribute('class')).toBe(
        clean(`gallery-list ${className}`),
      );
      unmount();
    }
  });

  it(`DragAndDropFile: \`\${styles.dropzone} \${dragging ? styles.dragging : ''}\` → classNames`, () => {
    const { container } = render(<DragAndDropFile onFileDrop={() => {}} />);
    const zone = container.querySelector('[class*="dropzone"]') as HTMLElement;
    const base = zone.getAttribute('class') as string;
    expect(base).not.toMatch(/\s/);
    fireEvent.dragOver(zone);
    const dragging = zone.getAttribute('class') as string;
    expect(dragging.split(' ')).toEqual([base, expect.stringMatching(/dragging/)]);
    fireEvent.dragLeave(zone);
    expect(zone.getAttribute('class')).toBe(base);
  });
});

describe('junk class tokens: Button never starts matching [class^="icon-"]', () => {
  it('no element of any Button variant has a class attribute starting with "icon-" (incl. after hover)', () => {
    const variants: Record<string, unknown>[] = [];
    for (const type of [undefined, ButtonTypes.primary, ButtonTypes.secondary, ButtonTypes.muted])
      for (const size of [undefined, ButtonSizes.small, ButtonSizes.extraLarge])
        for (const extra of [
          {},
          { icon: IconNames.caretDown },
          { icon: IconNames.caretDown, iconLargeOnHover: true, iconPosition: 'right' },
          { icon: IconNames.caretDown, isLoading: true },
          { className: undefined, textColor: ButtonTextColors.ado, rounded: true },
          { iconLeft: IconNames.caretDown, iconRight: IconNames.caretDown, disabled: true },
        ])
          variants.push({ type, size, children: 'Label', ...extra });
    for (const props of variants) {
      const { container, unmount } = render(
        <Button {...(props as Record<string, unknown> as React.ComponentProps<typeof Button>)} />,
      );
      const button = container.querySelector('button') as HTMLElement;
      fireEvent.mouseOver(button.parentElement as HTMLElement);
      for (const el of container.querySelectorAll('[class]'))
        expect(el.getAttribute('class'), JSON.stringify(props)).not.toMatch(/^icon-/);
      expect(container.querySelectorAll('[class^="icon-"]').length).toBe(0);
      unmount();
    }
  });
});
