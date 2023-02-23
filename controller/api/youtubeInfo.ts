import { contentType } from "mime-types"
import { android } from "../utils/userAgents.js"

import type {
  Request,
  Response
} from "express"
import {
  YoutubeResponse,
  YTThumbnail,
  YTSimpleFormat,
  YTAdaptiveVideoFormat,
  YTAdaptiveAudioFormat
} from "../types.js"

const YOUTUBE_API_URL = "https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8"

export default async function handler(req: Request, res: Response) {

  const { id } = req.query

  if (typeof id !== "string")
    return res.status(400).send("id query parameter is not of type string")

  if (!isValidYoutubeID(id))
    return res.status(400).send("invalid id")

  let youtubeRes
  try {
    youtubeRes = await fetch(YOUTUBE_API_URL, {
      method: "POST",
      headers: {
        "user-agent": android,
        "content-type": contentType("json").toString()
      },
      body: JSON.stringify(youtubePostData(id))
    }).then(r => r.json())
  } catch (err) { return res.status(502).send("failed fetching Youtube api") }

  if (!isValidYoutubeResponse(youtubeRes))
    return res.status(502).send("Youtube's server send unkown response")

  const response: YoutubeResponse = {
    videoDetails: {
      videoId: youtubeRes.videoDetails.videoId,
      title: youtubeRes.videoDetails.title,
      lengthSeconds: youtubeRes.videoDetails.lengthSeconds,
      thumbnail: {
        thumbnails: youtubeRes.videoDetails.thumbnail.thumbnails
      },
      viewCount: youtubeRes.videoDetails.viewCount,
      author: youtubeRes.videoDetails.author,
    },
    streamingData: {
      formats: youtubeRes.streamingData.formats,
      adaptiveFormats: youtubeRes.streamingData.adaptiveFormats,
    },
  }

  res.json({ success: true, data: response })

}

const isValidYoutubeID = (id: string): boolean => typeof id === "string" && Boolean(id.match(/^[a-zA-Z0-9_-]{11}$/))

const youtubePostData = (id: string) => ({
  "videoId": id,
  "context": {
    "client": {
      "clientName": "ANDROID",
      "clientVersion": "17.10.35",
      "androidSdkVersion": 30
    },
  },
})

const isValidYoutubeResponse = (obj: any): obj is YoutubeResponse => {
  return typeof obj?.videoDetails?.videoId === "string"
    && typeof obj.videoDetails.title === "string"
    && typeof obj.videoDetails.lengthSeconds === "string"

    && Array.isArray(obj.videoDetails.thumbnail?.thumbnails)
    && obj.videoDetails.thumbnail.thumbnails.every((thumbnail: any) => isYTThumbnail(thumbnail))

    && typeof obj.videoDetails.viewCount === "string"
    && typeof obj.videoDetails.author === "string"

    && Array.isArray(obj.streamingData?.formats)
    && obj.streamingData.formats.every((format: any) => isYTSimpleFormat(format))

    && Array.isArray(obj.streamingData?.adaptiveFormats)
    && obj.streamingData.adaptiveFormats.every((format: any) => isYTAdaptiveVideoFormat(format) || isYTAdaptiveAudioFormat(format))
}

const isYTThumbnail = (obj: any): obj is YTThumbnail => {
  return typeof obj?.url === "string"
    && typeof obj.height === "number"
    && typeof obj.width === "number"
}

const isYTSimpleFormat = (obj: any): obj is YTSimpleFormat => {
  return typeof obj?.itag === "number"
    && typeof obj.url === "string"
    && typeof obj.mimeType === "string"
    && typeof obj.width === "number"
    && typeof obj.height === "number"
    && typeof obj.fps === "number"
    && typeof obj.qualityLabel === "string"
    && typeof obj.bitrate === "number"
}

const isYTAdaptiveVideoFormat = (obj: any): obj is YTAdaptiveVideoFormat => {
  return typeof obj?.itag === "number"
    && typeof obj.url === "string"
    && typeof obj.mimeType === "string"
    && typeof obj.width === "number"
    && typeof obj.height === "number"
    && typeof obj.fps === "number"
    && typeof obj.qualityLabel === "string"
    && typeof obj.averageBitrate === "number"
}

const isYTAdaptiveAudioFormat = (obj: any): obj is YTAdaptiveAudioFormat => {
  return typeof obj?.itag === "number"
    && typeof obj.url === "string"
    && typeof obj.mimeType === "string"
    && typeof obj.averageBitrate === "number"
}
