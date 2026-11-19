// Pass this function to page.evaluate on the verifier's existing guarded Storybook page.
module.exports = function readTooltipGeometry(text = 'Edit business details') {
  const popper = [...document.querySelectorAll('[role="tooltip"]')].find((element) =>
    element.textContent.trim() === text,
  );
  if (!popper) return null;

  const box = (element) => element?.getBoundingClientRect().toJSON() ?? null;
  const centre = (rect) => (rect ? rect.left + rect.width / 2 : null);
  const snapshot = (element) => {
    if (!element) return null;
    const css = getComputedStyle(element);
    return {
      tag: element.tagName,
      id: element.id,
      className: element.getAttribute('class'),
      testId: element.getAttribute('data-testid'),
      slot: element.getAttribute('data-slot'),
      rect: box(element),
      offsetWidth: element.offsetWidth,
      clientWidth: element.clientWidth,
      clientLeft: element.clientLeft,
      scrollWidth: element.scrollWidth,
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop,
      position: css.position,
      transform: css.transform,
      left: css.left,
      paddingLeft: css.paddingLeft,
      paddingRight: css.paddingRight,
      overflowX: css.overflowX,
      overflowY: css.overflowY,
      scrollbarGutter: css.scrollbarGutter,
    };
  };
  const chain = (element) => {
    const result = [];
    for (let node = element?.parentElement; node; node = node.parentElement) result.push(snapshot(node));
    return result;
  };
  const triggers = [...document.querySelectorAll('[aria-label], [aria-describedby], [aria-labelledby]')].filter(
    (element) => !popper.contains(element) && (
      element.getAttribute('aria-label') === text ||
      (popper.id && ['aria-describedby', 'aria-labelledby'].some((attribute) =>
        element.getAttribute(attribute)?.split(/\s+/).includes(popper.id),
      ))
    ),
  );
  const anchor = triggers[0];
  const arrow = popper.querySelector('[data-slot="tooltip-arrow"], .MuiTooltip-arrow, [data-popper-arrow]');
  const anchorCenterX = centre(box(anchor));
  const arrowCenterX = centre(box(arrow));
  const centredLeft = anchorCenterX === null ? null : anchorCenterX - popper.getBoundingClientRect().width / 2;
  const visual = window.visualViewport;
  const paper = document.querySelector('.MuiDrawer-paper');

  return {
    fonts: document.fonts.status,
    placement: popper.getAttribute('data-popper-placement'),
    hiddenReference: popper.hasAttribute('data-popper-reference-hidden'),
    escapedPopper: popper.hasAttribute('data-popper-escaped'),
    browser: navigator.userAgent,
    viewport: {
      innerWidth,
      innerHeight,
      devicePixelRatio,
      scrollX,
      scrollY,
      scrollbarWidth: innerWidth - document.documentElement.clientWidth,
      visual: visual && { width: visual.width, height: visual.height, offsetLeft: visual.offsetLeft, offsetTop: visual.offsetTop },
    },
    html: snapshot(document.documentElement),
    body: { ...snapshot(document.body), inlineStyle: document.body.getAttribute('style') },
    drawer: snapshot(paper),
    anchor: snapshot(anchor),
    triggerCandidates: triggers.map(snapshot),
    anchorAncestors: chain(anchor),
    popper: snapshot(popper),
    popperAncestors: chain(popper),
    offsetParent: snapshot(popper.offsetParent),
    arrow: snapshot(arrow),
    anchorCenterX,
    arrowCenterX,
    centredLeft,
    shiftFromCentredLeft: centredLeft === null ? null : popper.getBoundingClientRect().left - centredLeft,
  };
};
