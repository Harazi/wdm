import type { ReactNode } from "react"

export interface DownloadEntryProperties {
  id: string
  url: URL
  fileName: string
  size: number | null
  resumable: boolean
  parts: number
}

export type MakeModalFunction = (component: ReactNode, title: string) => void
export type CloseModalFunction = VoidFunction
export type AddNewDownloadEntry = (url: URL, name: string, parts: number, resumable: boolean, size: number | null) => void
export type RemoveDownloadEntryFunction = (id: string) => void
