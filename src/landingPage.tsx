import React from "react"

export default function LandingPage() {

  return (
    <div className="grid place-items-center h-full mx-8">
      <img src="/img/update-illustration.svg" alt="update illustration" />
      <div className="text-slate-50">
        <p className="mb-2">
          Your browser doesn't seem to support <a href="https://wicg.github.io/file-system-access/" className="text-blue-500">File System Access</a>.
        </p>
        <p>
          Use the latest version of <a href="https://www.google.com/chrome/" className="text-blue-500">Chrome</a> to Access this website
        </p>
      </div>
    </div>
  )
}
