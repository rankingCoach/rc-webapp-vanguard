import * as fs from 'fs';
import * as path from 'path';

export class HookLoader {
  private static readonly HOOKS_DIR = path.join(process.cwd(), 'data', 'hooks');

  static loadAll(): any[] {
    if (!fs.existsSync(this.HOOKS_DIR)) return [];
    const files = fs.readdirSync(this.HOOKS_DIR).filter((f) => f.endsWith('.json'));
    return files
      .map((f) => {
        try {
          return JSON.parse(fs.readFileSync(path.join(this.HOOKS_DIR, f), 'utf-8'));
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
