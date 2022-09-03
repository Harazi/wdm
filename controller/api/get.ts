import { Readable } from "node:stream"
import {
  allowedRequestHeaders,
  allowedResponseHeaders,
  enforcedRequestHeaders
} from "../utils/headers.js"

import type { ReadableStream } from "node:stream/web"
import type {
  Request,
  Response
} from "express"

export default function handler(req: Request, res: Response) {

  const { url: urlParam } = req.query

  if (typeof urlParam !== "string")
    return res.status(400).send("url query parameter is not of type string")

  let url: URL

  try { url = new URL(urlParam) }
  catch (err) { return res.status(400).send("invalid url") }

  const fetchHeaders = new Headers()

  allowedRequestHeaders.forEach(header => {
    const reqHeader = req.headers[header]
    if (typeof reqHeader === "string")
      fetchHeaders.set(header, reqHeader)
  })

  fetchHeaders.set("host", url.host)
  fetchHeaders.set("origin", url.origin)
  fetchHeaders.set("referer", url.origin.concat('/'))

  enforcedRequestHeaders.forEach(([key, value]) => fetchHeaders.set(key, value))

  fetch(url, {
    redirect: "follow",
    headers: fetchHeaders
  })
    .then(async serverRes => {

      if (!serverRes.body)
        return res.status(502).send("the intended server did not send response body")

      const responseHeaders = {} as any

      allowedResponseHeaders.forEach(header => {
        if (serverRes.headers.has(header))
          responseHeaders[header] = serverRes.headers.get(header)
      })

      responseHeaders["x-wdm-finalurl"] = serverRes.url

      res.writeHead(serverRes.status, serverRes.statusText, responseHeaders)

      Readable.fromWeb(serverRes.body as ReadableStream).pipe(res)
    })
    .catch(err => !res.headersSent && res.status(500).json(err))
}
