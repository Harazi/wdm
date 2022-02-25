import React from "react"

export default function DownloadEntry({ url, name }) {

  let CONTENTLENGTH = 0
  
  const [isDownloading, setIsDownloading] = React.useState(true)

  const [bytesDownloaded, setBytesDownloaded] = React.useState(0)

  React.useEffect(() => {

    if (!isDownloading)
      return

    const abortController = new AbortController()

    ;(async () => {
      
      const fileHandle = await window.downloadDirHandle.getFileHandle(name, { create: true })
  
      const fileWriteable = await fileHandle.createWritable({ keepExistingData: true })
  
  
      fetch("http://localhost:5000/api/get", {
        signal: abortController.signal,
        headers: {
          'x-wdm': url,
        }
      }).then(async (res) => {

        const length = res.headers.get("content-length")
        CONTENTLENGTH = length

        const reader = res.body.getReader()

        while(true) {
          
          const { done, value } = await reader.read()

          if (done) {
            fileWriteable.close()
            setIsDownloading(false)
            break
          }

          fileWriteable.write(value)

          setBytesDownloaded(bytesDownloaded + value.length)

        }

      })

    })()

    return abortController.abort

  }, [])

  return (
    <li>

      <p className="filename">
        {name}
      </p>

      <span className="download-url" title={url}>
        {url}
      </span>

      <div className="download-prog">
        {/* replace it with a div container and n span children
                  the n is relative to the download parts. e.g. 8 spans */}
        <progress max="100" value={((bytesDownloaded / CONTENTLENGTH) * 100) || 0}></progress>
      </div>
      
      <div className="controll-button">
        <button type="button" className="play"></button>
      </div>
    </li>
  )

}