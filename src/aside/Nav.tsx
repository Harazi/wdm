import React from "react"

export default function Nav({ children }: { children: React.ReactNode}) {
  return (
    <nav>
      <ol>
        {children}
      </ol>
    </nav>
  )
}
