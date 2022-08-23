import { URL, fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import express from "express"
import range from "@ceicc/range"

import apiGet from "./api/get.js"
import apiYoutubeInfo from "./api/youtubeInfo.js"

const CWD = resolve(dirname(fileURLToPath(import.meta.url)), "..")

const router = express.Router({ strict: true })

export default router

router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Headers", "x-wdm")
  res.setHeader("Access-Control-Expose-Headers", "content-length, x-wdm-finalurl")
  next()
})

router.get('/api/get', apiGet)

router.get('/api/youtube', apiYoutubeInfo)

router.get('*', range({
  baseDir: resolve(CWD, "public"),
  maxAge: process.env.NODE_ENV === "production" ? 86400 : 0
}))

// router.get("*", express.static(resolve(CWD, "/public"), {
//   maxAge: process.env.NODE_ENV === "production" ? 86400000 : 0,
// }))
