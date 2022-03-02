import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

export default {

  entry: "./src/app.jsx",

  output: {
    path: join(dirname(fileURLToPath(import.meta.url)), "public/js"),
    filename: "bundle.js"
  },

  mode: "development",

  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"]
          }
        }
      }
    ]
  },

  devServer: {
    port: 8080,
    // contentBase: join(dirname(fileURLToPath(import.meta.url)), "public"),
    static: './public',
  }
}