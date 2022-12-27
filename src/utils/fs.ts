import { get, set } from "idb-keyval"

export async function dlDir() {
  // Get the directory handle from IndexedDB
  let dirHandle = await get<FileSystemDirectoryHandle>('downloadDir')

  // If there is no directory at the DB, get one and add it
  if (!dirHandle) {
    dirHandle = await selectDownloadDirectory()
  }

  // Verify read/write permissions
  while (!(await verifyPermission(dirHandle, true))) {
    alert('permissions are needed!')
  }

  return dirHandle
}

async function selectDownloadDirectory() {
  let dirHandle

  do {
    dirHandle = await showDirectoryPicker({ startIn: "downloads" }).catch(err => {
      console.error(err)
      alert('You need to select a download directory')
    })
  } while (!dirHandle);

  await set('downloadDir', dirHandle)

  return dirHandle
}

async function verifyPermission(fileHandle: FileSystemHandle, readWrite: boolean) {
  const options: { mode?: 'readwrite' } = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}
