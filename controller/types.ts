export type LinkInfoApiResponse = {
  success: true,
  data: LinkInfo
} | {
  success: false,
  data: null
}

export type LinkInfo = {
  finalUrl: string
  contentLength: number | "unknown"
  acceptRange: boolean
}

export type YoutubeResponse = {
  videoDetails: {
    author: string
    lengthSeconds: string
    title: string
    viewCount: string
    thumbnail: {
      thumbnails: {
        url: string
        height: number
        width: number
      }[]
    }
  }
  streamingData: {
    formats: {
      url: string
      mimeType: string
      qualityLabel: string
      fps: number
    }[]
  }
}

