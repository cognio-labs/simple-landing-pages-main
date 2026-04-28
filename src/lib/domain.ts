/**
 * Utility to handle subdomain detection and routing.
 */

export function getSubdomain(hostname: string, mainDomain: string): string | null {
  if (hostname === mainDomain || hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return null;
  }

  if (hostname.endsWith(`.${mainDomain}`)) {
    return hostname.replace(`.${mainDomain}`, '');
  }

  return null;
}

export const MAIN_DOMAIN = "aryanai.studio"; // Change this to your actual domain
