import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * The design tokens the library is tested against: a released ss-design-system
 * served by its CDN. The repository is private and not published to npm, so the
 * CDN is the only way a public library can reach it. The version lives in one
 * place, test/tokens.config.json; bumping it is how the library adopts a
 * release.
 */
export type TokenFile = '_variables.css' | '_dark.css';

const config = JSON.parse(readFileSync(join(process.cwd(), 'test/tokens.config.json'), 'utf8')) as { designSystem: string };

export const DESIGN_SYSTEM_VERSION: string = config.designSystem;

// Under jest's 90s test timeout, so a hung CDN fails naming the URL.
const FETCH_TIMEOUT = 15_000;

export function cdnUrl(file: TokenFile, version = DESIGN_SYSTEM_VERSION): string {
  return `https://cdn.slicesoft.dev/design-system/ss-design-system-v${version}/css/${file}`;
}

/**
 * The slicesoft stylesheet for the pinned version. The first call downloads it
 * into a cache on disk (git-ignored), so a full e2e run makes one request per
 * file and a machine that has run the suite once keeps working offline.
 * Without the network and without a cache it fails naming the URL: a missing
 * stylesheet would otherwise surface as layouts measured at zero.
 */
export async function slicesoftCss(file: TokenFile, cacheDir = join(process.cwd(), '.cache/design-system')): Promise<string> {
  const cached = join(cacheDir, DESIGN_SYSTEM_VERSION, file);
  if (existsSync(cached)) return readFileSync(cached, 'utf8');

  const url = cdnUrl(file);
  let css: string;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    css = await response.text();
    if (!css.includes('--ss-')) throw new Error('not a design-token stylesheet');
  } catch (error) {
    throw new Error(`Design tokens v${DESIGN_SYSTEM_VERSION} unavailable: ${url} (${(error as Error).message})`);
  }

  // Written aside and renamed into place: with several jest workers on a cold
  // cache, another one may find the file while this one is still writing it.
  mkdirSync(join(cacheDir, DESIGN_SYSTEM_VERSION), { recursive: true });
  const partial = `${cached}.${process.pid}.tmp`;
  writeFileSync(partial, css);
  renameSync(partial, cached);
  return css;
}

/**
 * Brands the library is tested with. slicesoft is the real one; the others are
 * test brands, not clients: small override files in test/brands/<brand>/, named
 * like the CDN files and loaded on top of slicesoft. Whatever a test brand does
 * not declare falls back to slicesoft, so no variable is ever undefined.
 */
export const TEST_BRANDS = ['slicesoft', 'neon-purple', 'organic-emerald'] as const;
export type TestBrand = (typeof TEST_BRANDS)[number];

export function brandOverrides(brand: TestBrand, file: TokenFile): string {
  if (brand === 'slicesoft') return '';
  return readFileSync(join(process.cwd(), 'test/brands', brand, file), 'utf8');
}
