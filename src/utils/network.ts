import type { ApiResponseGuard, LinkInfo } from "@backend/types"

export async function fetchLinkInfo(url: string): Promise<ApiResponseGuard<LinkInfo>> {
  try {
    const linkInfo = await fetch(`api/linkInfo?url=${encodeURIComponent(url)}`).then(res => res.json())
    return linkInfo
  } catch (err) {
    console.error(err)
    return { success: false, data: null }
  }
}
