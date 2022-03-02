import express from "express"
import range from "@ceicc/range"
import http from "node:http"
import https from "node:https"
import { URL } from "node:url"

const app = express()

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "x-wdm")
  res.setHeader("Access-Control-Expose-Headers", "content-length, x-wdm-finalurl")
  console.log("CORS Middleware")
  next()
})

app.get('/api/get', (req, res) => {

  const href = req.headers["x-wdm"]

  console.log("new api request to: ", href)

  if (!href)
    return res.sendStatus(404)
  
  delete req.headers["x-wdm"]


  // requestPage(href, req.headers, serverRes => {
  proxyRequestPage(href, req.headers, serverRes => {

    res.writeHead(serverRes.statusCode, serverRes.statusMessage, serverRes.headers)
    serverRes.pipe(res)

  }, error => {

    console.error(error)
    !res.headersSent && res.sendStatus(500)

  })
})

app.get('*', range({ baseDir: './public', maxAge: 0 }))

app.listen(5000, () => console.log("localhost:5000"))

function requestPage(href, headers, cb, errorCb) {

  delete headers["host"]
  delete headers["origin"]

  const url = new URL(href)

  const options = {
    headers: {
      ...headers,
      Host: url.host,
      Origin: url.origin
    }
  }

  if (url.protocol === "http:")
    http.get(url, options, handleRes).on("error", errorCb)
  else
    https.get(url, options, handleRes).on("error", errorCb)

  function handleRes(res) {

    console.log(res.statusCode, res.statusMessage)

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

function proxyRequestPage(href, headers, cb, errorCb) {

  delete headers["host"]
  delete headers["origin"]

  const url = new URL(href)

  if (url.protocol === "http:")
    return errorCb("http proxy hasn't been implmented yet!")

  const proxyOptions = {
    method: "CONNECT",
    host: "192.168.42.129",
    port: 1337,
    path: `${url.host}:443`
  }

  const proxyReq = http.request(proxyOptions)

  proxyReq.on("connect", (proxyRes, socket) => {

    https.get(url, {
      headers: {
        ...headers,
        Host: url.host,
        Origin: url.origin,
        referer: `${url.origin}/`
      },
      agent: new https.Agent({ socket })
    }, res => {

      console.log(res.statusCode, res.statusMessage)

      if (res.statusCode.toString()[0] === "3" && "location" in res.headers) {
        
        if (res.headers.location[0] === "/") {
          proxyRequestPage(url.origin + res.headers.location, headers, cb, errorCb)
        }
        
        else {
          proxyRequestPage(res.headers.location, headers, cb, errorCb)
        }

        return
      }

      res.headers["x-wdm-finalurl"] = url.href

      delete res.headers["set-cookie"]

      cb(res)

    })

  })

  proxyReq.end()
}