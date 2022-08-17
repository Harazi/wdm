import React from "react"
import prettyMS from "pretty-ms"
import { humanNumber } from "../utils/humanNumber"

export default function YoutubeFile({ makePopup, addNewDownload, details }) {

  const detailsDummy = {
    author: "Kick-Tube TV",
    title: "PARKOUR VS CARS compilation 2015",
    lengthSeconds: "333",
    viewCount: "1020792",
    thumbnail: {
      url: "https://i.ytimg.com/vi/DFYRQ_zQ-gk/hqdefault.jpg?sqp=-oaymwEiCKgBEF5IWvKriqkDFQgBFQAAAAAYASUAAMhCPQCAokN4AQ==&rs=AOn4CLCH3UGofUvts891G38hEA27nwPVgA",
      width: 168,
      height: 94
    },
    formats: [
      {
        mimeType: "video/mp4",
        extension: "mp4",
        qualityLabel: "360p",
        fps: 25,
        url: "https://rr3---sn-hvcpat-wxqr.googlevideo.com/videoplayback?expire=1648508346&ei=WulBYvrrHY71WrixgrAG&ip=5.110.250.137&id=o-AMWBdwV09LPuvm0Q_ULg94V7TGeVHK_7PzP9IyHVCKku&itag=18&source=youtube&requiressl=yes&mh=t_&mm=31%2C29&mn=sn-hvcpat-wxqr%2Csn-4wg7zne7&ms=au%2Crdu&mv=m&mvi=3&pl=24&initcwndbps=472500&spc=4ocVC8O96W0FfaiyLarh5rslcyNG&vprv=1&mime=video%2Fmp4&ns=vwR6Z4p2LbHObulScBL5e4sG&gir=yes&clen=29207063&ratebypass=yes&dur=332.649&lmt=1444046373967349&mt=1648486380&fvip=3&fexp=24001373%2C24007246&c=WEB&n=lCF5oF0i0BWXrrMysS5&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cspc%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRAIgaXgtdlOst49sr_pQQ-qZJGsRNaRuopF00Wte6-6JCGQCIBuoa3vav9o2YjQkFLkTJvdEXc8Rm1iVpHgBxOoQiNy0&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgDp5Ias9GO_7ibqhXUK5SX8MConk986B_XkD5ixtHaKACIQCFGdrvwEZGEEBB1WByNnDjXcQVyhovGkhxopm1dqk_sg%3D%3D"
      },
      {
        mimeType: "video/mp4",
        extension: "mp4",
        qualityLabel: "720p",
        fps: 25,
        url: "https://rr3---sn-hvcpat-wxqr.googlevideo.com/videoplayback?expire=1648508346&ei=WulBYvrrHY71WrixgrAG&ip=5.110.250.137&id=o-AMWBdwV09LPuvm0Q_ULg94V7TGeVHK_7PzP9IyHVCKku&itag=22&source=youtube&requiressl=yes&mh=t_&mm=31%2C29&mn=sn-hvcpat-wxqr%2Csn-4wg7zne7&ms=au%2Crdu&mv=m&mvi=3&pl=24&initcwndbps=472500&spc=4ocVC8O96W0FfaiyLarh5rslcyNG&vprv=1&mime=video%2Fmp4&ns=vwR6Z4p2LbHObulScBL5e4sG&cnr=14&ratebypass=yes&dur=332.649&lmt=1507883443493122&mt=1648486380&fvip=3&fexp=24001373%2C24007246&c=WEB&n=lCF5oF0i0BWXrrMysS5&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cspc%2Cvprv%2Cmime%2Cns%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AOq0QJ8wRAIgPjPxzxvqzJoQ8R30DABuKo6QJOjAh5HAdDaR5_Bk3oMCIBzQD4Uuw2Q4mJkVVqk7OfawH-pom141BWXQ1XuNCu1T&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgDp5Ias9GO_7ibqhXUK5SX8MConk986B_XkD5ixtHaKACIQCFGdrvwEZGEEBB1WByNnDjXcQVyhovGkhxopm1dqk_sg%3D%3D"
      }
    ]
  }

  const [videoFormat, setVideoFormat] = React.useState(0)

  const videoFileNameInput = React.useRef()

  function startDownload() {

    const fileName = `${videoFileNameInput.current.value}.${details.formats[videoFormat].extension}`

    console.log(details.formats[videoFormat].url, fileName)

    addNewDownload(details.formats[videoFormat].url, fileName)

    makePopup(false)
  }

  return (
    <div className="youtube-file">

      <div className="video-details">

        <div className="thumbnail-wrapper">
          <img src={details.thumbnail.url} alt="video thumbnail" />
        </div>

        <div className="text-container">

          <div className="title-author">
            <p className="title" title="video title">{details.title}</p>
            <span className="author">By <em>{details.author}</em></span>
          </div>

          <div className="meta-info">
            <div className="length" title="video length">{prettyMS(
              Number(Number(details.lengthSeconds).toFixed() + "000"),
              { colonNotation: true }
            )}</div>
            •
            <div className="views" title="views count">{humanNumber(details.viewCount, 1)}</div>
          </div>

        </div>

      </div>

      <div className="video-config">

        <div className="video-quality-picker label-input-pair">

          <label htmlFor="video-quality-picker">Choose video quality</label>
          <select id="video-quality-picker" value={videoFormat} onChange={e => setVideoFormat(e.target.value)}>

            {details.formats.map((format, i) => (
              <option key={i} value={i}>
                {format.qualityLabel}; {format.mimeType}; {format.fps}fps
              </option>
            ))}

          </select>
        </div>

        <div className="video-name">

          <div className="base-name label-input-pair">
            <label htmlFor="base-name">Video name</label>
            <input
              id="base-name"
              type="text"
              defaultValue={details.title}
              ref={videoFileNameInput} />
          </div>

          <div className="dot">
            <span>.</span>
          </div>

          <div className="extension">
            <input type="text" value={details.formats[videoFormat].extension} readOnly />
          </div>

        </div>

      </div>

      <div className="controll-buttons">

        <div className="button-container cancel">
          <button type="button" onClick={() => makePopup(false)}>Cancel</button>
        </div>

        <div className="button-container start">
          <button type="button" onClick={startDownload}>Download</button>
        </div>

      </div>

    </div>
  )
}