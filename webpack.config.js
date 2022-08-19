import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

export default {

  entry: "./src/index.tsx",

  output: {
    path: join(dirname(fileURLToPath(import.meta.url)), "public", "js"),
    filename: "bundle.js"
  },

  mode: "development",

  resolve: {
    extensions: ['.ts', '.tsx', '...']
  },

  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"]
          }
        },
        "ts-loader",
      ]
    }]
  },
}
