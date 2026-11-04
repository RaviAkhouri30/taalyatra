import { createHash } from 'node:crypto';

/** The digests Cloudinary accepts. SHA-256 unless a test needs its documented SHA-1 example. */
export type SignatureAlgorithm = 'sha256' | 'sha1';

/**
 * Signs request parameters the way Cloudinary checks them: sorted by name, joined as
 * `name=value` with `&`, then the secret appended with no separator.
 *
 * @param params What to sign. Leave out `file`, `cloud_name`, `resource_type` and `api_key`.
 * @param apiSecret The account's secret.
 * @param algorithm The digest to use.
 * @returns The signature in hexadecimal.
 */
export function signParams(
  params: Readonly<Record<string, string>>,
  apiSecret: string,
  algorithm: SignatureAlgorithm = 'sha256',
): string {
  const payload = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}=${value}`)
    .join('&');
  return createHash(algorithm).update(`${payload}${apiSecret}`).digest('hex');
}
