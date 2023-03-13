interface StreamToFileParams {
  reader: ReadableStreamDefaultReader
  writable: FileSystemWritableFileStream
  on?: StreamToFileEvents
}

interface StreamToFileEvents {
  progress?: (bufferLength: number) => void
  finish?: (totalTimeMS: number) => void
  error?: (error: unknown) => void
}

export async function streamToFile({ reader, writable, on }: StreamToFileParams) {
  const startTime = Date.now()

  while (true) {
    let done, value

    try {
      ({ done, value } = await reader.read())
    } catch (err) {
      on?.error?.(err)
      break
    }

    if (done) {
      on?.finish?.(Date.now() - startTime)
      break
    }

    await writable.write(value)
    on?.progress?.(value.length)
  }
}
