import express from "express"
import controller from "./router.js"

const app = express()

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*")
//   console.log("CORS Middleware")
//   next()
// })

app.use(controller)

app.listen(5000, () => console.log("localhost:5000"))


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