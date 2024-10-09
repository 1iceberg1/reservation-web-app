import { getConfig } from '../../config';

import { Storage } from '@google-cloud/storage';

let bucket;

if (getConfig().GOOGLE_CLOUD_PLATFORM_CREDENTIALS) {
  const serviceAccount = JSON.parse(
    getConfig().GOOGLE_CLOUD_PLATFORM_CREDENTIALS
  );

  bucket = new Storage({
    projectId: serviceAccount.project_id,
    credentials: serviceAccount,
  }).bucket(getConfig().FILE_STORAGE_BUCKET);
} else {
  bucket = new Storage().bucket(getConfig().FILE_STORAGE_BUCKET);
}

export default class GoogleCloudFileStorage {
  static async upload(file, privateUrl, filename, publicRead, maxSizeInBytes) {
    const expires = Date.now() + 10 * 60 * 1000;

    const fileUpload = bucket.file(privateUrl);

    const conditions: Array<any> = [];
    const fields: any = {};

    if (maxSizeInBytes) {
      conditions.push(['content-length-range', 0, maxSizeInBytes]);
    }

    if (publicRead) {
      fields.acl = 'public-read';
    }

    await file.generateSignedPostPolicyV4({
      expires,
      virtualHostedStyle: true,
      conditions,
      fields,
    });

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', error => {
      console.log('Something is wrong! Unable to upload at the moment');
    });

    blobStream.on('finish', () => {
      console.log('success');
    });

    blobStream.end(file.buffer);

    return this.downloadUrl(filename, privateUrl, publicRead);
  }

  /**
   * Returns a signed download URL.
   */
  static async downloadUrl(
    filename,
    privateUrl,
    publicRead = true,
    tokenExpiresAt?
  ) {
    if (publicRead) {
      return `https://storage.googleapis.com/${
        getConfig().FILE_STORAGE_BUCKET
      }/${privateUrl}`;
    }

    tokenExpiresAt = tokenExpiresAt || Date.now() + 1000 * 60 * 60;

    const response = await bucket.file(privateUrl).getSignedUrl({
      action: 'read',
      expires: tokenExpiresAt,
      version: 'v4',
    });

    if (response && response[0]) {
      return response[0];
    }

    return response;
  }
}
