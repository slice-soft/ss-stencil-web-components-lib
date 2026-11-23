import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
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
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    css = await response.text();
  } catch (error) {
    throw new Error(`Design tokens v${DESIGN_SYSTEM_VERSION} unavailable: ${url} (${(error as Error).message})`);
  }

  mkdirSync(join(cacheDir, DESIGN_SYSTEM_VERSION), { recursive: true });
  writeFileSync(cached, css);
  return css;
}
