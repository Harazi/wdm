export type LinkInfoApiResponse = {
  success: true,
  data: LinkInfo
} | {
  success: false,
  data: null
}

export type LinkInfo = {
  finalUrl: string
  contentLength: number | "unknown"
  acceptRange: boolean
}
