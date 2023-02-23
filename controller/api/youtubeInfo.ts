import { contentType } from "mime-types"
import { android } from "../utils/userAgents.js"

import type {
  Request,
  Response
} from "express"
import { YoutubeResponse } from "../types.js"

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

  res.json({

    author: youtubeRes.videoDetails.author,
    title: youtubeRes.videoDetails.title,
    lengthSeconds: youtubeRes.videoDetails.lengthSeconds,
    viewCount: youtubeRes.videoDetails.viewCount,
    thumbnail: youtubeRes.videoDetails.thumbnail.thumbnails[0],
    // alias: f > formatObject
    formats: youtubeRes.streamingData.formats.map(f => ({
      mimeType: f.mimeType.split(";")[0],
      extension: extension(f.mimeType.split(";")[0]),
      qualityLabel: f.qualityLabel,
      fps: f.fps,
      url: f.url
    }))

  })

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

const isValidYoutubeResponse = (obj: any): obj is YoutubeResponse => Boolean(

  typeof obj?.videoDetails?.author === "string"
    && typeof obj.videoDetails.lengthSeconds === "string"
    && typeof obj.videoDetails.title === "string"
    && typeof obj.videoDetails.viewCount === "string"
    && Array.isArray(obj.videoDetails.thumbnail?.thumbnails)
    && obj.videoDetails.thumbnail.thumbnails.every((thumbnail: any) => Boolean(
      typeof thumbnail?.url === "string"
        && typeof thumbnail.height === "number"
        && typeof thumbnail.width === "number"
    ))

    && Array.isArray(obj.streamingData?.formats)
    && obj.streamingData.formats.every((format: any) => Boolean(
      typeof format?.url === "string"
        && typeof format.mimeType === "string"
        && typeof format.qualityLabel === "string"
        && typeof format.fps === "number"
    ))
)
