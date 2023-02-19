export type ApiResponseGuard<T> = { success: true, data: T } | { success: false, data: null }

export type LinkInfo = {
  finalUrl: string
  contentLength: number | "unknown"
  acceptRange: boolean
}

export interface YTThumbnail {
  url: string
  width: number
  height: number
}

export interface YTObjectFormat {
  itag: number
  url: string
  mimeType: string
  contentLength: string
}

export interface YTSimpleFormat extends YTObjectFormat {
  width: number
  height: number
  fps: number
  qualityLabel: string
  bitrate: number
}

export interface YTAdaptiveVideoFormat extends YTObjectFormat {
  width: number
  height: number
  fps: number
  qualityLabel: string
  averageBitrate: number
}

export interface YTAdaptiveAudioFormat extends YTObjectFormat {
  averageBitrate: number
}

export type YoutubeResponse = {
  videoDetails: {
    videoId: string
    title: string
    lengthSeconds: string
    thumbnail: {
      thumbnails: YTThumbnail[]
    }
    viewCount: string
    author: string
  }
  streamingData: {
    formats: YTSimpleFormat[]
    adaptiveFormats: Array<YTAdaptiveAudioFormat | YTAdaptiveVideoFormat>
  }
}
