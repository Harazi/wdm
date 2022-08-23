import defaultUserAgent from "../utils/defaultUserAgent.js"

import type {
  Request,
  Response
} from "express"

export default function handler(req: Request, res: Response) {

  const href = req.headers["x-wdm"]

  if (typeof href !== "string")
    return res.sendStatus(400)

  delete req.headers["x-wdm"]

  let url: URL

  try { url = new URL(href) }
  catch (err) { return res.sendStatus(400) }

  fetch(url, {
    redirect: "follow",
    headers: {
      'user-agent': req.headers["user-agent"] ?? defaultUserAgent,
      Host: url.host,
      Origin: url.origin,
      referer: url.origin.concat('/'),
    }
  })
    .then(async serverRes => {

      if (!serverRes.body)
        return res.sendStatus(503)

      serverRes.headers.append("x-wdm-finalurl", serverRes.url)
      serverRes.headers.delete("set-cookie")

      res.writeHead(serverRes.status, serverRes.statusText, ...serverRes.headers)

      const reader = serverRes.body.getReader()

      while (true) {

        const { done, value } = await reader.read()

        if (done) {
          res.end()
          break
        }

        res.write(value)
      }
    })
    .catch(err => !res.headersSent && res.sendStatus(500))
}
