/**
 * Storage permissions.
 *
 * @id - Used to identify the rule on permissions and upload.
 * @folder - Folder where the files will be saved
 * @maxSizeInBytes - Max allowed size in bytes
 * @bypassWritingPermissions - Does not validate if the user has permission to write
 * @publicRead - The file can be publicly accessed via the URL without the need for a signed token
 */
export default class Storage {
  static get values() {
    return {
      userAvatar: {
        id: 'userAvatar',
        folder: 'user/avatar/:userId',
        maxSizeInBytes: 10 * 1024 * 1024,
        bypassWritingPermissions: true,
        publicRead: true,
      },
      reservationDocument: {
        id: 'reservationDocument',
        folder: 'reservation/document/image',
        maxSizeInBytes: 10 * 1024 * 1024,
        bypassWritingPermissions: true,
        publicRead: true,
      },
    };
  }
}
