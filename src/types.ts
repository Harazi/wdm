import type { ReactNode } from "react"

export interface DownloadEntryProperties {
  id: string
  url: URL
  fileName: string
  size: number | null
  resumable: boolean
  parts: number
}

export type MakePopupFunction = (component: ReactNode, title: string) => void
export type ClosePopupFunction = VoidFunction
export type AddNewDownloadEntry = (url: URL, name: string, parts: number, resumable: boolean, size: number | null) => void
export type RemoveDownloadEntryFunction = (id: string) => void

interface ThumbnailObject {
  url: string
  width: number
  height: number
}

interface VideoFormat {
  mimeType: string
  extension: string
  qualityLabel: string
  fps: number
  url: string
}

export interface YoutubeApiResponse {
  author: string
  title: string
  lengthSeconds: string
  viewCount: string
  thumbnail: ThumbnailObject
  formats: VideoFormat[]
}
