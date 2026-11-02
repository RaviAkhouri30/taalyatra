// Proves the 0009 design's assumptions on a real Cloudinary account, before anything relies on them:
//   1. a SHA-256 signed upload with the function's exact settings is accepted;
//   2. the incoming transformation removes GPS data from the stored file (a control upload without it
//      shows that this test can actually see GPS data);
//   3. delivered images carry no GPS data either;
//   4. optionally, a real iPhone HEIC photo uploads and can be delivered.
//
// The keys come from your shell and go nowhere else: this prints no key, secret or signature.
// It deletes everything it uploads.
//
//   npm run prove:cloudinary -- --dry-run            (no account or network: checks the test itself)
//   CLOUDINARY_CLOUD_NAME=… CLOUDINARY_API_KEY=… CLOUDINARY_API_SECRET=… \
//     npm run prove:cloudinary -- [path/to/photo.heic]
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import {
  ALLOWED_FORMATS,
  INCOMING_TRANSFORMATION,
  MEDIA_FOLDER,
} from '../api/dist/lib/api-constants.js';
import { signParams } from '../api/dist/lib/cloudinary-signature.js';

const SAMPLE_JPEG = 'public/images/og/taal-yatra.jpg';
const GPS_IFD_TAG = 0x8825;
const API = 'https://api.cloudinary.com/v1_1';
const EXIF_HEADER = Buffer.from('Exif\0\0', 'latin1');

/** @returns A rational number: numerator, then denominator. */
function rational(numerator, denominator = 1) {
  const bytes = Buffer.alloc(8);
  bytes.writeUInt32LE(numerator, 0);
  bytes.writeUInt32LE(denominator, 4);
  return bytes;
}

/** @returns A TIFF block whose only content is a GPS position (Pune), as a phone would write. */
function gpsTiff() {
  const entry = (tag, type, count, value) => {
    const bytes = Buffer.alloc(12);
    bytes.writeUInt16LE(tag, 0);
    bytes.writeUInt16LE(type, 2);
    bytes.writeUInt32LE(count, 4);
    value.copy(bytes, 8);
    return bytes;
  };
  const long = (value) => {
    const bytes = Buffer.alloc(4);
    bytes.writeUInt32LE(value, 0);
    return bytes;
  };
  const ifd = (entries, nextIfd = 0) => {
    const head = Buffer.alloc(2);
    head.writeUInt16LE(entries.length, 0);
    return Buffer.concat([head, ...entries, long(nextIfd)]);
  };
  const IFD0_OFFSET = 8;
  const GPS_OFFSET = IFD0_OFFSET + 18;
  const GPS_LENGTH = 2 + 4 * 12 + 4;
  const latitudeOffset = GPS_OFFSET + GPS_LENGTH;
  const longitudeOffset = latitudeOffset + 24;
  return Buffer.concat([
    Buffer.from([0x49, 0x49, 0x2a, 0x00]),
    long(IFD0_OFFSET),
    ifd([entry(GPS_IFD_TAG, 4, 1, long(GPS_OFFSET))]),
    ifd([
      entry(1, 2, 2, Buffer.from('N\0\0\0', 'latin1')),
      entry(2, 5, 3, long(latitudeOffset)),
      entry(3, 2, 2, Buffer.from('E\0\0\0', 'latin1')),
      entry(4, 5, 3, long(longitudeOffset)),
    ]),
    rational(18),
    rational(31),
    rational(0),
    rational(73),
    rational(51),
    rational(0),
  ]);
}

/** @returns The JPEG with a GPS block inserted straight after its start marker. */
function withGps(jpeg) {
  const payload = Buffer.concat([EXIF_HEADER, gpsTiff()]);
  const header = Buffer.alloc(4);
  header.writeUInt16BE(0xffe1, 0);
  header.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([jpeg.subarray(0, 2), header, payload, jpeg.subarray(2)]);
}

/** @returns Whether a file holds a GPS block: JPEG's APP1, or any format's raw EXIF data. */
function hasGps(file) {
  let from = file.indexOf(EXIF_HEADER);
  while (from !== -1) {
    const tiff = from + EXIF_HEADER.length;
    if (tiffHasGps(file.subarray(tiff))) {
      return true;
    }
    from = file.indexOf(EXIF_HEADER, tiff);
  }
  // WebP and HEIF can store the block without the header, so look for TIFF's start as well.
  for (const start of [
    Buffer.from([0x49, 0x49, 0x2a, 0x00]),
    Buffer.from([0x4d, 0x4d, 0x00, 0x2a]),
  ]) {
    let at = file.indexOf(start);
    while (at !== -1) {
      if (tiffHasGps(file.subarray(at))) {
        return true;
      }
      at = file.indexOf(start, at + 1);
    }
  }
  return false;
}

/** @returns Whether a TIFF block's first directory points at GPS data. */
function tiffHasGps(tiff) {
  if (tiff.length < 8) {
    return false;
  }
  const little = tiff.toString('latin1', 0, 2) === 'II';
  const u16 = (at) => (little ? tiff.readUInt16LE(at) : tiff.readUInt16BE(at));
  const u32 = (at) => (little ? tiff.readUInt32LE(at) : tiff.readUInt32BE(at));
  const directory = u32(4);
  if (directory + 2 > tiff.length) {
    return false;
  }
  const count = u16(directory);
  for (let index = 0; index < count; index += 1) {
    const entry = directory + 2 + index * 12;
    if (entry + 12 > tiff.length) {
      return false;
    }
    if (u16(entry) === GPS_IFD_TAG) {
      return true;
    }
  }
  return false;
}

/** @returns The account's details from the shell, or stops with what's missing. */
function readAccount() {
  const {
    CLOUDINARY_CLOUD_NAME: cloud,
    CLOUDINARY_API_KEY: key,
    CLOUDINARY_API_SECRET: secret,
  } = process.env;
  if (!cloud || !key || !secret) {
    console.error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.');
    process.exit(2);
  }
  return { cloud, key, secret };
}

/** Uploads a file; `transformation` is left out for the control. */
async function upload(account, file, transformation) {
  const params = {
    allowed_formats: ALLOWED_FORMATS,
    public_id: `${MEDIA_FOLDER}/proof-${randomUUID()}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
    ...(transformation ? { transformation } : {}),
  };
  const form = new FormData();
  Object.entries(params).forEach(([name, value]) => form.set(name, value));
  form.set('api_key', account.key);
  form.set('signature', signParams(params, account.secret));
  form.set('file', new Blob([file]));
  const response = await fetch(`${API}/${account.cloud}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Upload refused (${response.status}): ${body.error?.message ?? 'no details'}`);
  }
  return body;
}

/** Deletes a test upload. */
async function destroy(account, publicId) {
  const params = {
    invalidate: 'true',
    public_id: publicId,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  await fetch(`${API}/${account.cloud}/image/destroy`, {
    method: 'POST',
    body: new URLSearchParams({
      ...params,
      api_key: account.key,
      signature: signParams(params, account.secret),
    }),
  });
}

/** @returns A delivered image's bytes, asked for as a browser that accepts WebP would. */
async function download(url, accept = 'image/webp,image/*') {
  const response = await fetch(url, { headers: { accept } });
  if (!response.ok) {
    throw new Error(`Couldn't fetch a delivered image (${response.status}).`);
  }
  return Buffer.from(await response.arrayBuffer());
}

const delivered = (account, transformation, publicId) =>
  `https://res.cloudinary.com/${account.cloud}/image/upload/${transformation}/${publicId}`;

const results = [];
function report(name, passed, detail = '') {
  results.push(passed);
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

/** Checks the test itself, with no network: it must see GPS data when it's there. */
function selfCheck(sample) {
  report('this test sees GPS data in a tagged photo', hasGps(withGps(sample)));
  report('this test sees none in the untagged sample', !hasGps(sample));
}

/** The real checks; everything uploaded is tracked, so it gets deleted even after a failure. */
async function prove(account, tagged, uploaded, heicPath) {
  const control = await upload(account, tagged, null);
  uploaded.push(control.public_id);
  const controlStored = await download(control.secure_url, '*/*');
  report(
    'control: without the transformation, GPS stays in the stored file',
    hasGps(controlStored),
  );

  const main = await upload(account, tagged, INCOMING_TRANSFORMATION);
  uploaded.push(main.public_id);
  report("a SHA-256 signed upload with the function's settings is accepted", true);
  report(
    'with the transformation, the stored file has no GPS',
    !hasGps(await download(main.secure_url, '*/*')),
  );
  for (const format of ['f_auto,q_auto,w_800', 'f_jpg,q_auto,w_800']) {
    const image = await download(delivered(account, format, main.public_id));
    report(`delivered image (${format}) has no GPS`, !hasGps(image), `${image.length} bytes`);
  }
  if (heicPath) {
    const heic = await upload(account, readFileSync(heicPath), INCOMING_TRANSFORMATION);
    uploaded.push(heic.public_id);
    report('a real HEIC photo uploads', true, `${heic.format}, ${heic.width}x${heic.height}`);
    report('its stored file has no GPS', !hasGps(await download(heic.secure_url, '*/*')));
    const asJpeg = await download(delivered(account, 'f_jpg,q_auto,w_800', heic.public_id));
    report(
      'it can be delivered as an image browsers show',
      asJpeg[0] === 0xff,
      `${asJpeg.length} bytes`,
    );
  }
}

const args = process.argv.slice(2);
const sample = readFileSync(SAMPLE_JPEG);
selfCheck(sample);
if (!args.includes('--dry-run')) {
  const account = readAccount();
  const uploaded = [];
  try {
    await prove(account, withGps(sample), uploaded, args[0]);
  } catch (error) {
    report('the checks ran to the end', false, error.message);
  } finally {
    await Promise.all(uploaded.map((id) => destroy(account, id)));
    console.log(`Deleted ${uploaded.length} test upload(s).`);
  }
}
const failed = results.filter((passed) => !passed).length;
console.log(failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
