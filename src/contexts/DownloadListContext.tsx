import React, { createContext, useState } from "react"
import type { ReactNode } from "react"

type DownloadEntry = {
  ID: `${DownloadEntry["url"]["href"]}__${DownloadEntry["fileName"]}`
  url: URL,
  fileName: `${string}.${string}`,
  size?: number,
  resumable: boolean,
  parts: number
}

type DownloadListType = {
  list: DownloadEntry[]
  add: (properties: DownloadEntry) => void
  remove: (ID: DownloadEntry["ID"]) => void
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
