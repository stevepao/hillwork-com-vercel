import {envValue} from './env.js';

export function getPublicConfig() {
  return {
    turnstileSiteKey: envValue('TURNSTILE_SITE_KEY', '') ?? '',
  };
}
