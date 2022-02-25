import express from "express"
import range from "@ceicc/range"
import http from "node:http"
import https from "node:https"
import { URL } from "node:url"

const app = express()

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin",  "http://localhost:5500")
  res.setHeader("Access-Control-Allow-Headers", "x-wdm, content-length")
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

  const url = new URL(href)

  const options = {
    headers: {
      ...headers,
      host: url.host,
      hostname: url.hostname
    }
  }

  if (url.protocol === "http:")
    http.get(url, options, cb).on("error", errorCb)
  else
    https.get(url, options, cb).on("error", errorCb)


  /*
  ** For Proxy Testing Only.
  ** DO NOT push for production
  */

  // http.request({
  //   method: "CONNECT",
  //   href: "http://192.168.42.129:1337/",
  //   protocol: "http:",
  //   // hostname: "192.168.42.129:1337",
  //   host: "192.168.42.129",
  //   port: 1337,
  //   path: url.hostname
  // }).on("connect", (res, socket) => {

  //   if (res.statusCode !== 200)
  //     return // Or `throw`?

  //   const agent = new http.Agent({ socket })
  //   options.agent = agent

  //   if (url.protocol === "http:")
  //     http.get(url, options, cb)
  //   else
  //     https.get(url, options, cb)
  // })

}

function proxyRequestPage(href, headers, cb, errorCb) {

  const url = new URL(href)

  console.log(url)

  if (url.protocol === "http:")
    return errorCb("http proxy hasn't been implmented yet!")

  const proxyReq = http.request({
    method: "CONNECT",
    host: "192.168.42.129",
    port: 1337,
    path: `${url.host}:443`,
    headers
  })

  proxyReq.on("connect", (proxyRes, socket) => {
    console.log(proxyRes.statusCode)
    console.dir(proxyRes.headers)

    https.get({
      host: url.host,
      path: '/',
      agent: new https.Agent({ socket })
    }, cb)
  })

  proxyReq.end()
}