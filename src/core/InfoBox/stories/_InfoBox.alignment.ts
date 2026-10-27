// Max distance (px) between a centre and the first line's centre that still counts as aligned (sub-pixel rounding)
const TOLERANCE = 1;

const centreOf = (rect: DOMRect): number => rect.top + rect.height / 2;

/**
 * Centre of the first rendered line of text (title, or first description line), measured on the first character.
 * A line box adds the same half-leading above and below the text, so the glyph box and the line share a centre.
 */
export const getFirstLineCentre = (box: HTMLElement): number | null => {
  // the body holds the title (when shown) then the description, so its first text is the first line;
  // an empty title (e.g. fading out after being cleared) has no text and is skipped
  const content = box.querySelector('[data-testid=info-box-body]');
  if (!content) return null;
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
  });
  const textNode = walker.nextNode();
  if (!textNode?.textContent) return null;

  const firstChar = textNode.textContent.search(/\S/);
  const range = document.createRange();
  range.setStart(textNode, firstChar);
  range.setEnd(textNode, firstChar + 1);
  const rect = range.getClientRects()[0];
  return rect ? centreOf(rect) : null;
};

/**
 * Checks every InfoBox under `root`: the type icon's glyph and the close button must be vertically centred on the first
 * line. The glyph (the icon's SVG), not the whole icon, because the warn triangle is shifted so its exclamation is centred.
 * Returns one message per problem, empty when everything lines up. Each box is named by its `data-case-key` cell.
 */
export const findFirstLineMisalignments = (root: HTMLElement): string[] => {
  const problems: string[] = [];

  root.querySelectorAll<HTMLElement>('[data-testid=info-box-content]').forEach((box, index) => {
    const name = box.closest<HTMLElement>('[data-case-key]')?.dataset.caseKey ?? `box ${index}`;
    const lineCentre = getFirstLineCentre(box);
    if (lineCentre === null) {
      problems.push(`${name}: no first line found`);
      return;
    }

    const check = (label: string, element: Element | null): void => {
      if (!element) {
        problems.push(`${name}: ${label} not rendered`);
        return;
      }
      const offset = centreOf(element.getBoundingClientRect()) - lineCentre;
      if (Math.abs(offset) > TOLERANCE) {
        problems.push(`${name}: ${label} centre is ${offset.toFixed(1)}px off the first line`);
      }
    };

    check('icon glyph', box.querySelector('[data-testid=info-box-icon] svg'));
    const closeButton = box.querySelector('[data-testid=info-box-cta_button]');
    if (closeButton) check('close button', closeButton);
  });

  return problems;
};
