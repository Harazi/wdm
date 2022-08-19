interface StreamToFileParams {
  reader: ReadableStreamDefaultReader
  writable: FileSystemWritableFileStream
  on?: StreamToFileEvents
}

interface StreamToFileEvents {
  progress?: (bufferLength: number) => void
  finish?: (totalTimeMS: number) => void
}

export async function streamToFile({ reader, writable, on }: StreamToFileParams) {
  const startTime = Date.now()
  while (true) {

    const { done, value } = await reader.read()

    if (done) {
      on?.finish?.(Date.now() - startTime)
      break
    }

    await writable.write(value)
    on?.progress?.(value.length)
  }
}
