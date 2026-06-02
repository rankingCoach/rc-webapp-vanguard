import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ITEMS_DIR = path.join(__dirname, '../../data/items');

export class HelperLoader {
  private static cache: any[] | null = null;

  static loadAll(): any[] {
    if (this.cache) return this.cache;
    if (!fs.existsSync(ITEMS_DIR)) return [];
    const files = fs.readdirSync(ITEMS_DIR).filter((f) => f.startsWith('helper__') && f.endsWith('.json'));
    this.cache = files
      .map((f) => {
        try {
          return JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, f), 'utf-8'));
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean);
    return this.cache;
  }

  static find(query: string) {
    const all = this.loadAll();
    const q = query.toLowerCase();
    return all.filter((h) => (h.name || '').toLowerCase().includes(q));
  }

  static getByName(name: string) {
    const all = this.loadAll();
    return all.find((h) => h.name === name || (h.name && h.name.toLowerCase() === name.toLowerCase()));
  }
}
