import React, { createContext, useState } from "react"
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

export const DownloadListContext = createContext<DownloadListType>(null as any)

// TODO: save the download state in the list
// TODO: save the list in localstorage
export const DownloadListProvider = ({ children }: { children: ReactNode }) => {

  const [list, setList] = useState<DownloadListType["list"]>([])

  const add: DownloadListType["add"] = ({ url, fileName, size, resumable, parts }) => {
    setList(list => [
      ...list,
      {
        ID: `${url.href}__${fileName}`,
        url,
        fileName,
        size,
        resumable,
        parts,
      }
    ])
  }


  const remove: DownloadListType["remove"] = (ID) => {
    setList(list => list.filter(entry => entry.ID !== ID))
  }

  return (
    <DownloadListContext.Provider value={{ list, add, remove }}>
      {children}
    </DownloadListContext.Provider>
  )
}
