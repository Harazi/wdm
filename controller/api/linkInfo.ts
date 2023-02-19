import defaultUserAgent from "../utils/defaultUserAgent.js"
import { enforcedRequestHeaders } from "../utils/headers.js"

import type {
  Request,
  Response
} from "express"

import type { ApiResponseGuard, LinkInfo } from "../types.js"

export default async function handler(req: Request, res: Response) {

  const { url: urlParam } = req.query

  if (typeof urlParam !== "string")
    return res.status(400).send("url query parameter is not of type string")

  let url: URL

  try { url = new URL(urlParam) }
  catch (err) { return res.status(400).send("invalid url") }

  const abortController = new AbortController()

  const fetchHeaders = new Headers(enforcedRequestHeaders)

  fetchHeaders.set("host", url.host)
  fetchHeaders.set("origin", url.origin)
  fetchHeaders.set("referer", url.origin.concat('/'))
  fetchHeaders.set("user-agent", req.headers["user-agent"] ?? defaultUserAgent)

  const fetchOne = fetch(url, { headers: fetchHeaders, redirect: "follow", signal: abortController.signal })
  fetchHeaders.set("range", "bytes=0-")
  const fetchTwo = fetch(url, { headers: fetchHeaders, redirect: "follow", signal: abortController.signal })

  Promise.all([fetchOne, fetchTwo])
    .then(async ([resOne, resTwo]) => {

      abortController.abort()

      const responseObj: ApiResponseGuard<LinkInfo> = {
        success: true,
        data: {
          finalUrl: resOne.url,
          contentLength: "unknown",
          acceptRange: false
        }
      }

      const contentLength = resOne.headers.get("content-length")
      const contentRange = resTwo.headers.get("content-range")

      if (!contentLength)
        return res.json(responseObj)

      responseObj.data.contentLength = Number(contentLength)

      if (
        resTwo.status === 206
        && contentRange === `bytes 0-${Number(contentLength) - 1}/${contentLength}`
      )
        responseObj.data.acceptRange = true

      res.json(responseObj)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ success: false, data: null })
    })
}
