import * as fs from 'fs';
import * as path from 'path';

export class HelperLoader {
  private static readonly HELPERS_DIR = path.join(process.cwd(), 'data', 'helpers');

  static loadAll(): any[] {
    if (!fs.existsSync(this.HELPERS_DIR)) return [];
    const files = fs.readdirSync(this.HELPERS_DIR).filter((f) => f.endsWith('.json'));
    return files
      .map((f) => {
        try {
          return JSON.parse(fs.readFileSync(path.join(this.HELPERS_DIR, f), 'utf-8'));
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean);
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
