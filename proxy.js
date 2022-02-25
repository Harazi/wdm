import http from "node:http"
import https from "node:https"
import { URL } from "node:url"

// let req = http.request({
//   host: "192.168.42.129",
//   port: 1337,
//   method: "CONNECT",
//   path: "duckduckgo.com:443"
// })

// req.on("connect", (proxyRes, socket) => {
//   console.log(proxyRes.statusCode)
//   console.dir(proxyRes.headers)

//   https.get({
//     host: "duckduckgo.com",
//     // port: 443,
//     // protocol: "http:",
//     path: '/',
//     agent: new https.Agent({ socket })
//   }, res => {
//     console.log(res.headers)
//     res.on("data", d => console.log(d.toString()))
//     res.on("end", () => console.log("finished"))
//   })
// })

// req.end()

let req = http.request({
  method: "CONNECT",
  host: "192.168.42.129",
  port: 1337,
  path: 'x.com'
}, res => {
  console.log(res.statusCode, res.headers)
  res.on("data", d => console.log(d.toString()))
  res.on("end", () => console.log("finished"))
})

req.on("connect", (proxyRes, socket) => {
  console.log(proxyRes.statusCode)
  console.dir(proxyRes.headers)

  http.get({
    host: "x.com",
    // port: 443,
    // protocol: "http:",
    path: '/',
    agent: new https.Agent({ socket })
  }, res => {
    console.log(res.statusCode, res.headers)
    res.on("data", d => console.log(d.toString()))
    res.on("end", () => console.log("finished"))
  })
})