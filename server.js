import express from "express"
import controller from "./controller-js/router.js"

const app = express()

app.use(controller)

app.listen(5000, "localhost", () => console.log("localhost:5000"))
