/** What `POST /api/media/sign` answers with (`ISignedUpload` in `api/`). */
export interface ISignedUploadDto {
  readonly uploadUrl: string;
  readonly fields: Readonly<Record<string, string>>;
}

/** The part of Cloudinary's upload response this app keeps, under Cloudinary's own names. */
export type ICloudinaryUploadDto = Readonly<
  Record<'public_id' | 'format', string> & Record<'version' | 'width' | 'height' | 'bytes', number>
>;
