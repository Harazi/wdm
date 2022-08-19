import React from "react";
import { format } from "bytes";
import prettyMS from "pretty-ms";

export function DownloadSummary({ time, size }: { time: number, size: number }) {
  return (
    <div className="download-summary">
      <span className="check-mark">
        <img src="icons/check-mark_24.png" alt="Check Mark" />
      </span>
      Downloaded {format(size, { unitSeparator: ' ' })} in {prettyMS(Number(time.toFixed() + "000"))}
    </div>
  );
}
