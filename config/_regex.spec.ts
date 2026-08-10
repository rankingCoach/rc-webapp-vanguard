import { describe, expect, it } from 'vitest';

import { REGEX } from './regex';

const IDN_EMAIL = 'info@die-bänd.com';

describe('REGEX.email', () => {
  it('should accept internationalised (IDN) domains', () => {
    expect(REGEX.email.test(IDN_EMAIL)).toBe(true);
    expect(REGEX.email.test('info@die-bänd.co.uk')).toBe(true);
    expect(REGEX.email.test('info@münchen.de')).toBe(true);
    expect(REGEX.email.test('info@пример.рф')).toBe(true);
  });

  it('should accept punycode-encoded domains', () => {
    expect(REGEX.email.test('info@xn--die-bnd-9wa.com')).toBe(true);
    expect(REGEX.email.test('info@пример.xn--p1ai')).toBe(true);
  });

  it('should accept ordinary ASCII addresses', () => {
    expect(REGEX.email.test('fred@domain.com')).toBe(true);
    expect(REGEX.email.test('a@b.co')).toBe(true);
    expect(REGEX.email.test('first.last@sub.domain.io')).toBe(true);
    expect(REGEX.email.test("o'brien+tag@domain.io")).toBe(true);
    expect(REGEX.email.test('user_name%test@domain.io')).toBe(true);
  });

  it('should reject invisible format characters that would break delivery', () => {
    expect(REGEX.email.test('info​@x.com')).toBe(false); // zero-width space
    expect(REGEX.email.test('info@x​.com')).toBe(false);
    expect(REGEX.email.test('info@x.com﻿')).toBe(false); // BOM
    expect(REGEX.email.test('info@x.com�')).toBe(false); // replacement char
    expect(REGEX.email.test('info@x.🎉')).toBe(false);
  });

  it('should reject malformed dots in the local part', () => {
    expect(REGEX.email.test('.info@x.com')).toBe(false);
    expect(REGEX.email.test('info.@x.com')).toBe(false);
    expect(REGEX.email.test('in..fo@x.com')).toBe(false);
  });

  it('should reject malformed domains', () => {
    expect(REGEX.email.test('info@-x.com')).toBe(false);
    expect(REGEX.email.test('info@x-.com')).toBe(false);
    expect(REGEX.email.test('info@x..com')).toBe(false);
    expect(REGEX.email.test('info@x.com.')).toBe(false);
    expect(REGEX.email.test('info@x.c')).toBe(false);
    expect(REGEX.email.test('info@x')).toBe(false);
    expect(REGEX.email.test('a@b.123')).toBe(false); // all-numeric TLD
  });

  it('should reject structurally invalid addresses', () => {
    expect(REGEX.email.test('invalid-email')).toBe(false);
    expect(REGEX.email.test('a b@x.com')).toBe(false);
    expect(REGEX.email.test('@x.com')).toBe(false);
    expect(REGEX.email.test('info@')).toBe(false);
    expect(REGEX.email.test('')).toBe(false);
  });

  it('should not be stateful between calls', () => {
    // a `g` flag here would make `test` advance lastIndex and flip results on repeat calls
    expect(REGEX.email.global).toBe(false);
    expect(REGEX.email.test(IDN_EMAIL)).toBe(true);
    expect(REGEX.email.test(IDN_EMAIL)).toBe(true);
  });
});
