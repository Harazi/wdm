export type LinkInfoApiResponse = {
  success: true,
  data: {
    finalUrl: string
    contentLength: number | "unknown"
    acceptRange: boolean
  }
} | {
  success: false,
  data: null
}
