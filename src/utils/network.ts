import type { ApiResponseGuard, LinkInfo, YoutubeResponse } from "@backend/types"

export async function fetchLinkInfo(url: string): Promise<ApiResponseGuard<LinkInfo>> {
  try {
    const linkInfo = await fetch(`api/linkInfo?url=${encodeURIComponent(url)}`).then(res => res.json())
    return linkInfo
  } catch (err) {
    console.error(err)
    return { success: false, data: null }
  }
}

export async function YTVideoMetadata(id: string): Promise<ApiResponseGuard<YoutubeResponse>> {
  try {
    const res = await fetch(`api/youtubeInfo?id=${id}`).then(res => res.json())
    return res
  } catch (err) {
    console.error(err)
    return { success: false, data: null }
  }
}
