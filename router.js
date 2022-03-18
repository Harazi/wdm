import express from "express"
import range from "@ceicc/range"
import http from "node:http"
import https from "node:https"
import { URL, fileURLToPath } from "node:url"
import { dirname } from "node:path"

const router = express.Router({ strict: true })


router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", "x-wdm")
  res.setHeader("Access-Control-Expose-Headers", "content-length, x-wdm-finalurl")
  next()
})

router.get('/api/get', (req, res) => {

  const href = req.headers["x-wdm"]

  //// console.log("new api request to: ", href)

  if (!href)
    return res.sendStatus(404)

  delete req.headers["x-wdm"]


  requestPage(href, req.headers, serverRes => {
  //// proxyRequestPage(href, req.headers, serverRes => {

    res.writeHead(serverRes.statusCode, serverRes.statusMessage, serverRes.headers)
    serverRes.pipe(res)

  }, error => {

    //// console.error(error)
    !res.headersSent && res.sendStatus(500)

  })
})

router.get('*', range({ baseDir: dirname(fileURLToPath(import.meta.url)) + '/public' }))


export default router


function requestPage(href, headers, cb, errorCb) {

  delete headers["host"]
  delete headers["origin"]

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