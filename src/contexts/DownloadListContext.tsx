import React, { createContext, useEffect, useState } from "react"
import { divrem } from "divrem"
import { pipeTo } from "../utils/pipeTo"
import { dlDir } from "../utils/fs"
import type { ReactNode } from "react"

export type DownloadEntry = {
  readonly ID: `${DownloadEntry["url"]["href"]}__${DownloadEntry["fileName"]}`
  readonly url: URL,
  readonly fileName: `${string}.${string}`,
  readonly size?: number,
  readonly resumable: boolean,
  readonly parts: number
  state: DownloadState
  readonly map: fragment[]
  ac: AbortController
}

export type DownloadListType = {
  readonly list: DownloadEntry[]
  add: (properties: Omit<DownloadEntry, "ID" | "state" | "map" | "ac">) => void
  remove: (ID: DownloadEntry["ID"]) => void
  get: (ID: DownloadEntry["ID"]) => DownloadEntry | undefined
  pause: (ID: DownloadEntry["ID"]) => void
  resume: (ID: DownloadEntry["ID"]) => void
}

export type fragment = {
  readonly from?: number
  readonly to?: number
  downloaded: number
  finished: boolean
}

export enum DownloadState {
  Downloading,
  Paused,
  Finished,
  Error,
}

const toResume: Array<DownloadEntry["ID"]> = []

export const DownloadListContext = createContext<DownloadListType>(null as any)

// TODO: save the download state in the list
// TODO: save the list in localstorage
export const DownloadListProvider = ({ children }: { children: ReactNode }) => {

  const [list, setList] = useState<DownloadListType["list"]>([])

  useEffect(() => {
    toResume.forEach(ID => {
      resume(ID)
      toResume.shift()
    })
  }) // intentionally no dependencies array

  const add: DownloadListType["add"] = ({ url, fileName, size, resumable, parts }) => {
    const ID = `${url.href}__${fileName}` as const

    setList(list => [
      {
        ID,
        url,
        fileName,
        size,
        resumable,
        parts,
        state: DownloadState.Paused,
        map: setupMap({ size, resumable, parts }),
        ac: new AbortController(),
      },
      ...list,
    ])

    // can't call `resume` here as the list won't update until the next render
    // also can't delay the call with `setTimeout` as it will call the old `resume` that has the old list reference
    // I really hate React
    toResume.push(ID)
  }

  const remove: DownloadListType["remove"] = (ID) => {
    setList(list => list.filter(entry => entry.ID !== ID))
  }

  const get: DownloadListType["get"] = (ID) => list.find(entry => entry.ID === ID)

  const resume: DownloadListType["resume"] = (ID) => {
    const entry = get(ID)
    if (!entry) {
      console.error("Couldn't find entry with ID", ID)
      return
    }

    const { map, state: status, ac: abortController, url, fileName } = entry
    const setStatus = (state: DownloadState) => entry.state = state
    const dlDirP = dlDir()

    map.forEach(async ({ from, to }, i) => {
      if (abortController.signal.aborted || status === DownloadState.Error) {
        return
      }

      let res: Response
      try {
        res = await fetch(`api/get?url=${encodeURIComponent(url.href)}`, {
          signal: abortController.signal,
          headers: from === undefined || to === undefined ? {} : {
            range: `bytes=${from}-${to}`
          }
        })
      } catch (err) {
        setStatus(DownloadState.Error)
        return
      }

      //TODO: Add a way to show errors to the user
      if (!res.body) throw new Error("Response body is null!")

      setStatus(DownloadState.Downloading)
      const reader = res.body.getReader()

      const writable = await fileHandle.createWritable({ keepExistingData: resume })
      if (resume) {
        await writable.seek(fragment.downloaded)
      }
      const writer = writable.getWriter()
      pipeTo({
        reader,
        writer,
        on: {
          progress: (length) => {
            map[i].downloaded += length
          },
          finish: async () => {
            await writable.close()
            map[i].finished = true
            if (entry.map.every(({ finished }) => finished)) {
              finalize(dirHandle, entry)
            }
          },
          error: async (err) => {
            await writer.close()

            // Save the parts for resuming?
            await dirHandle.removeEntry(`${fileName}.part_${i}`)
          },
        }
      })
    })
  }

  const pause: DownloadListType["pause"] = (ID) => {
    const entry = get(ID)
    if (!entry) {
      console.error("Couldn't find entry with ID", ID)
      return
    }

    entry.ac.abort()
    entry.state = DownloadState.Paused
  }

  return (
    <DownloadListContext.Provider value={{ list, add, remove, get, resume, pause }}>
      {children}
    </DownloadListContext.Provider>
  )
}

const setupMap = ({ size, resumable, parts }: { size?: number; resumable: boolean; parts: number }): fragment[] => {
  if (!size || !resumable || parts === 1) return [{ downloaded: 0, finished: false }]

  const { count, rem } = divrem(size, parts)
  let progress = 0

  const map = Array(parts).fill(null).map(() => ({
    from: progress,
    to: (progress += count) - 1,
    downloaded: 0,
    finished: false,
  }))

  map[map.length - 1].to += rem

  return map
}

const finalize = async (dirHandle: FileSystemDirectoryHandle, entry: DownloadEntry) => {
  const writable = await dirHandle.getFileHandle(entry.fileName, { create: true })
    .then(handle => handle.createWritable({ keepExistingData: false }))

  for (const index in entry.map) {
    const stream = await dirHandle.getFileHandle(`${entry.fileName}.part_${index}`, { create: false })
      .then(handle => handle.getFile())
      .then(file => file.stream())

    await stream.pipeTo(writable, { preventClose: true })
    await dirHandle.removeEntry(`${entry.fileName}.part_${index}`)
  }

  await writable.close()
  entry.state = DownloadState.Finished
}

