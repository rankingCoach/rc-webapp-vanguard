import { readFileSync } from 'node:fs';
import path from 'node:path';
import { hexToRgb as muiHexToRgb } from '@mui/system';
import { describe, expect, it } from 'vitest';
import { hexToRgb, hexToRgba } from './hex-to-rgba';

/** Own hexToRgb equals @mui/system's for every input shape, and the helper no longer imports MUI. */
const INPUTS = [
  '#fff',
  '#FFF',
  '#000',
  '#1976d2',
  '#1976D2',
  '#abcd',
  '#11223344',
  '#0a0b0c',
  '#12345',
  '#1',
  '#',
  '#ff00ff80',
];

describe('hexToRgb own core equals @mui/system', () => {
  for (const input of INPUTS) {
    it(JSON.stringify(input), () => {
      expect(hexToRgb(input)).toBe(muiHexToRgb(input));
    });
  }
  it('hexToRgba keeps its format', () => {
    expect(hexToRgba('#1976d2', 0.5)).toBe('rgba(25, 118, 210,0.5)');
  });
  it('imports nothing from @mui', () => {
    const src = readFileSync(path.join(__dirname, 'hex-to-rgba.ts'), 'utf8');
    expect(src).not.toMatch(/from '@mui\//);
  });
});
