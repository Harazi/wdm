import express from "express"
import range from "@ceicc/range"
import http from "http"
import https from "https"
import { URL, fileURLToPath } from "url"
import { dirname } from "path"
import axios from "axios"
import { extension } from "mime-types"

const router = express.Router({ strict: true })

export default router


router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", "x-wdm")
  res.setHeader("Access-Control-Expose-Headers", "content-length, x-wdm-finalurl")
  next()
})

router.get('/api/get', (req, res) => {

  const href = req.headers["x-wdm"]

  if (!href)
    return res.sendStatus(404)

  delete req.headers["x-wdm"]


  requestPage(href, req.headers, serverRes => {

    res.writeHead(serverRes.statusCode, serverRes.statusMessage, serverRes.headers)
    serverRes.pipe(res)

  }, error => {

    // console.error(error)
    !res.headersSent && res.sendStatus(500)

  })
})

router.get('/api/youtube', async (req, res) => {

  const { id } = req.query

  if (!isValidYoutubeID(id))
    return res.sendStatus(400)

  try {

    var { status, data: youtubeResponse } = await axios.post("https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8", youtubePostData(id), {
      headers: {
        'user-agent': req.headers["user-agent"]
      }
    })

  } catch (error) {

    return res.sendStatus(500)

  }

  if (!isValidYoutubeResponse(youtubeResponse))
    return res.sendStatus(503)

  res.statusCode = status

  const responseData = {

    author: youtubeResponse.videoDetails.author,
    title: youtubeResponse.videoDetails.title,
    lengthSeconds: youtubeResponse.videoDetails.lengthSeconds,
    viewCount: youtubeResponse.videoDetails.viewCount,
    thumbnail: youtubeResponse.videoDetails.thumbnail.thumbnails[0],
    // alias: f > formatObject
    formats: youtubeResponse.streamingData.formats.map(f => ({
      mimeType: f.mimeType.split(";")[0],
      extension: extension(f.mimeType.split(";")[0]),
      qualityLabel: f.qualityLabel,
      fps: f.fps,
      url: f.url
    }))

  }

  res.json(responseData)

})

router.get('*', range({
  baseDir: dirname(fileURLToPath(import.meta.url)) + '/public',
  maxAge: process.env.NODE_ENV === "production" ? 86400 : 0
}))


function requestPage(href, headers, cb, errorCb) {

  delete headers["host"]
  delete headers["origin"]
  delete headers["accept-encoding"]

  const url = new URL(href)

  const options = {
    headers: {
      ...headers,
      Host: url.host,
      Origin: url.origin,
      referer: url.origin + '/'
    }
  }

  if (url.protocol === "http:")
    http.get(url, options, handleRes).on("error", errorCb)
  else
    https.get(url, options, handleRes).on("error", errorCb)

  function handleRes(res) {

    if (res.statusCode.toString()[0] === "3" && "location" in res.headers) {

      if (res.headers.location[0] === "/") {
        requestPage(url.origin + res.headers.location, headers, cb, errorCb)
      }

      else {
        requestPage(res.headers.location, headers, cb, errorCb)
      }

      return
    }

    res.headers["x-wdm-finalurl"] = url.href

    delete res.headers["set-cookie"]

    cb(res)
  }

}

function isValidYoutubeID(id) {
  return typeof id === "string" && id.match(/^[a-zA-Z0-9_-]{11}$/)
}

function youtubePostData(id) {
  return {

    "context": {
      "client": {
        "hl": "en",
        "clientName": "WEB",
        "clientVersion": "2.20210721.00.00",
        "clientFormFactor": "UNKNOWN_FORM_FACTOR",
        "clientScreen": "WATCH",
        "mainAppWebInfo": {
          "graftUrl": `/watch?v=${id}`
        }
      },
      "user": {
        "lockedSafetyMode": false
      },
      "request": {
        "useSsl": true,
        "internalExperimentFlags": [

        ],
        "consistencyTokenJars": [

        ]
      }
    },
    "videoId": id,
    "playbackContext": {
      "contentPlaybackContext": {
        "vis": 0,
        "splay": false,
        "autoCaptionsDefaultOn": false,
        "autonavState": "STATE_NONE",
        "html5Preference": "HTML5_PREF_WANTS",
        "lactMilliseconds": "-1"
      }
    },
    "racyCheckOk": false,
    "contentCheckOk": false

  }
}

function isValidYoutubeResponse(response) {

  return typeof response === "object"

    && "streamingData" in response
    && typeof response.streamingData === "object"

    && "formats" in response.streamingData
    && Array.isArray(response.streamingData.formats)

    && response.streamingData.formats.reduce((prev, current) => (
      prev
      && typeof current === "object"
      && "url" in current
      && typeof current.url === "string"
      && "mimeType" in current
      && typeof current.mimeType === "string"
      && "fps" in current
      && typeof current.fps === "number"
      && "qualityLabel" in current
      && typeof current.qualityLabel === "string"
    ), true)

    && "videoDetails" in response
    && typeof response.videoDetails === "object"

    && "title" in response.videoDetails
    && typeof response.videoDetails.title === "string"

    && "lengthSeconds" in response.videoDetails
    && typeof response.videoDetails.lengthSeconds === "string"

    && "author" in response.videoDetails
    && typeof response.videoDetails.author === "string"

    && "viewCount" in response.videoDetails
    && typeof response.videoDetails.viewCount === "string"

    && "thumbnail" in response.videoDetails
    && typeof response.videoDetails.thumbnail === "object"

    && "thumbnails" in response.videoDetails.thumbnail
    && Array.isArray(response.videoDetails.thumbnail.thumbnails)

    && typeof response.videoDetails.thumbnail.thumbnails[0] === "object"

    && "url" in response.videoDetails.thumbnail.thumbnails[0]
    && typeof response.videoDetails.thumbnail.thumbnails[0].url === "string"
}