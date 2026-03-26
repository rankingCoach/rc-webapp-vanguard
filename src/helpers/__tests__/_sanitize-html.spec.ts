import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from '../sanitize-html';

describe('sanitizeHtml', () => {
  describe('empty / nullish input', () => {
    it('returns empty string for empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('returns empty string for falsy input (null cast)', () => {
      expect(sanitizeHtml(null as unknown as string)).toBe('');
    });

    it('returns empty string for falsy input (undefined cast)', () => {
      expect(sanitizeHtml(undefined as unknown as string)).toBe('');
    });
  });

  describe('plain text', () => {
    it('passes through plain text unchanged', () => {
      expect(sanitizeHtml('Hello world')).toBe('Hello world');
    });
  });

  describe('default allowed tags', () => {
    it('keeps default allowed tags', () => {
      expect(sanitizeHtml('<p>Hello <b>there</b></p>')).toBe('<p>Hello <b>there</b></p>');
    });

    it('strips unknown tags but keeps their text content', () => {
      expect(sanitizeHtml('<wiggly>Hello</wiggly>')).toBe('Hello');
    });

    it('strips unknown tags nested inside allowed tags', () => {
      expect(sanitizeHtml('<div><wiggly>Hello</wiggly></div>')).toBe('<div>Hello</div>');
    });

    it('keeps deeply nested allowed tags', () => {
      expect(sanitizeHtml('<div><p>Hello <b>there</b></p></div>')).toBe('<div><p>Hello <b>there</b></p></div>');
    });
  });

  describe('custom allowedTags', () => {
    it('allows only specified tags', () => {
      expect(sanitizeHtml('<blue><red><green>Cheese</green></red></blue>', { allowedTags: ['blue', 'green'] })).toBe(
        '<blue><green>Cheese</green></blue>',
      );
    });

    it('strips all tags when allowedTags is empty array', () => {
      expect(sanitizeHtml('<p>Hello <b>there</b></p>', { allowedTags: [] })).toBe('Hello there');
    });
  });

  describe('dangerous tags removal', () => {
    it('removes script tags and their content', () => {
      expect(sanitizeHtml('<script>alert("xss")</script><p>Safe</p>')).toBe('<p>Safe</p>');
    });

    it('removes style tags and their content', () => {
      expect(sanitizeHtml('<style>.foo { color: red }</style><p>Safe</p>')).toBe('<p>Safe</p>');
    });

    it('removes iframe tags', () => {
      expect(sanitizeHtml('<iframe src="https://evil.com"></iframe><p>Safe</p>')).toBe('<p>Safe</p>');
    });

    it('removes object tags', () => {
      expect(sanitizeHtml('<object data="evil.swf"></object><p>Safe</p>')).toBe('<p>Safe</p>');
    });

    it('removes embed tags', () => {
      expect(sanitizeHtml('<embed src="evil.swf" /><p>Safe</p>')).toBe('<p>Safe</p>');
    });

    it('removes noscript tags', () => {
      expect(sanitizeHtml('<noscript>fallback</noscript><p>Safe</p>')).toBe('<p>Safe</p>');
    });
  });

  describe('event handler attributes', () => {
    it('strips onclick attributes', () => {
      expect(sanitizeHtml('<p onclick="evil()">Hello</p>')).toBe('<p>Hello</p>');
    });

    it('strips onmouseover attributes', () => {
      expect(sanitizeHtml('<div onmouseover="evil()">Hello</div>')).toBe('<div>Hello</div>');
    });

    it('strips any on* attribute', () => {
      expect(sanitizeHtml('<a href="/" onload="evil()">link</a>')).toBe('<a href="/">link</a>');
    });

    it('strips uppercase ON* attributes', () => {
      expect(sanitizeHtml('<p ONCLICK="evil()">Hello</p>')).toBe('<p>Hello</p>');
    });

    it('strips mixed-case On* attributes', () => {
      expect(sanitizeHtml('<div OnMouseOver="evil()">Hello</div>')).toBe('<div>Hello</div>');
    });
  });

  describe('dangerous URL schemes', () => {
    it('strips javascript: href', () => {
      expect(sanitizeHtml('<a href="javascript:alert(1)">click</a>')).toBe('<a>click</a>');
    });

    it('strips vbscript: href', () => {
      expect(sanitizeHtml('<a href="vbscript:evil()">click</a>')).toBe('<a>click</a>');
    });

    it('strips data: href', () => {
      expect(sanitizeHtml('<a href="data:text/html,<h1>xss</h1>">click</a>')).toBe('<a>click</a>');
    });

    it('strips uppercase JAVASCRIPT: href', () => {
      expect(sanitizeHtml('<a href="JAVASCRIPT:alert(1)">click</a>')).toBe('<a>click</a>');
    });

    it('strips mixed-case JavaScript: href', () => {
      expect(sanitizeHtml('<a href="JavaScript:alert(1)">click</a>')).toBe('<a>click</a>');
    });

    it('strips javascript: href with leading whitespace', () => {
      expect(sanitizeHtml('<a href="  javascript:alert(1)">click</a>')).toBe('<a>click</a>');
    });

    it('strips dangerous schemes from src attribute', () => {
      expect(
        sanitizeHtml('<img src="javascript:evil()" />', {
          allowedTags: ['img'],
          allowedAttributes: { img: ['src'] },
        }),
      ).toBe('<img>');
    });

    it('strips data: scheme from src attribute', () => {
      expect(
        sanitizeHtml('<img src="data:image/svg+xml,<svg onload=alert(1)>" />', {
          allowedTags: ['img'],
          allowedAttributes: { img: ['src'] },
        }),
      ).toBe('<img>');
    });

    it('strips dangerous schemes from action attribute', () => {
      expect(
        sanitizeHtml('<form action="javascript:evil()"><input /></form>', {
          allowedTags: ['form', 'input'],
          allowedAttributes: { form: ['action'] },
        }),
      ).toBe('<form><input></form>');
    });

    it('strips dangerous schemes from formaction attribute', () => {
      expect(
        sanitizeHtml('<button formaction="javascript:evil()">submit</button>', {
          allowedTags: ['button'],
          allowedAttributes: { button: ['formaction'] },
        }),
      ).toBe('<button>submit</button>');
    });

    it('allows safe http: href', () => {
      expect(sanitizeHtml('<a href="http://example.com">link</a>')).toBe('<a href="http://example.com">link</a>');
    });

    it('allows safe https: href', () => {
      expect(sanitizeHtml('<a href="https://example.com">link</a>')).toBe('<a href="https://example.com">link</a>');
    });

    it('allows relative href', () => {
      expect(sanitizeHtml('<a href="/page">link</a>')).toBe('<a href="/page">link</a>');
    });
  });

  describe('default allowed attributes', () => {
    it('keeps href, name, target, rel on anchor tags by default', () => {
      expect(sanitizeHtml('<a href="http://example.com" name="foo" target="_blank" rel="noopener">link</a>')).toBe(
        '<a href="http://example.com" name="foo" target="_blank" rel="noopener">link</a>',
      );
    });

    it('strips unknown attributes not in the allowlist', () => {
      expect(sanitizeHtml('<a href="http://example.com" whizbang="boom">link</a>')).toBe(
        '<a href="http://example.com">link</a>',
      );
    });

    it('strips attributes from tags that have no attribute allowlist entry', () => {
      expect(sanitizeHtml('<p class="highlight">Hello</p>')).toBe('<p>Hello</p>');
    });
  });

  describe('custom allowedAttributes', () => {
    it('allows specified attributes on specified tags', () => {
      expect(sanitizeHtml('<p class="highlight">Hello</p>', { allowedAttributes: { p: ['class'] } })).toBe(
        '<p class="highlight">Hello</p>',
      );
    });

    it('does not allow attributes on tags not listed in allowedAttributes', () => {
      expect(
        sanitizeHtml('<div class="foo"><p class="bar">Hi</p></div>', {
          allowedAttributes: { p: ['class'] },
        }),
      ).toBe('<div><p class="bar">Hi</p></div>');
    });
  });

  describe('combined allowedTags and allowedAttributes', () => {
    it('applies both tag and attribute filtering together', () => {
      expect(
        sanitizeHtml('<div class="box"><p id="one" class="text">Hello</p><span>World</span></div>', {
          allowedTags: ['div', 'p'],
          allowedAttributes: { div: ['class'], p: ['id'] },
        }),
      ).toBe('<div class="box"><p id="one">Hello</p>World</div>');
    });

    it('strips dangerous URL attributes even when tag and attribute are both allowed', () => {
      expect(
        sanitizeHtml('<a href="javascript:evil()">click</a>', {
          allowedTags: ['a'],
          allowedAttributes: { a: ['href'] },
        }),
      ).toBe('<a>click</a>');
    });

    it('strips on* attributes even when tag and attribute are both explicitly listed', () => {
      expect(
        sanitizeHtml('<p onclick="evil()">Hello</p>', {
          allowedTags: ['p'],
          allowedAttributes: { p: ['onclick'] },
        }),
      ).toBe('<p>Hello</p>');
    });
  });

  describe('allowedClasses', () => {
    it('keeps only listed class names', () => {
      expect(
        sanitizeHtml('<span class="vanguard-input-mark-red evil-class">text</span>', {
          allowedAttributes: { span: ['class'] },
          allowedClasses: ['vanguard-input-mark-red'],
        }),
      ).toBe('<span class="vanguard-input-mark-red">text</span>');
    });

    it('removes the class attribute entirely when no classes pass the filter', () => {
      expect(
        sanitizeHtml('<span class="evil-class another-bad-class">text</span>', {
          allowedAttributes: { span: ['class'] },
          allowedClasses: ['vanguard-input-mark-red'],
        }),
      ).toBe('<span>text</span>');
    });

    it('allows multiple listed class names on one element', () => {
      expect(
        sanitizeHtml('<span class="vanguard-input-mark-red vanguard-input-mark-green">text</span>', {
          allowedAttributes: { span: ['class'] },
          allowedClasses: ['vanguard-input-mark-red', 'vanguard-input-mark-green', 'vanguard-input-mark-blue'],
        }),
      ).toBe('<span class="vanguard-input-mark-red vanguard-input-mark-green">text</span>');
    });

    it('does not restrict classes when allowedClasses is not set', () => {
      expect(
        sanitizeHtml('<span class="any-class">text</span>', {
          allowedAttributes: { span: ['class'] },
        }),
      ).toBe('<span class="any-class">text</span>');
    });

    it('applies class filtering to nested spans', () => {
      expect(
        sanitizeHtml(
          '<p>Hello <span class="vanguard-input-mark-red evil">world</span> and <span class="evil">more</span></p>',
          {
            allowedAttributes: { span: ['class'] },
            allowedClasses: ['vanguard-input-mark-red', 'vanguard-input-mark-green', 'vanguard-input-mark-blue'],
          },
        ),
      ).toBe('<p>Hello <span class="vanguard-input-mark-red">world</span> and <span>more</span></p>');
    });
  });

  describe('comments', () => {
    it('strips HTML comments', () => {
      expect(sanitizeHtml('<p><!-- secret -->Hello</p>')).toBe('<p>Hello</p>');
    });
  });
});
