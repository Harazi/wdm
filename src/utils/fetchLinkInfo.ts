import type { LinkInfoApiResponse } from "../types"

export async function fetchLinkInfo(url: string): Promise<LinkInfoApiResponse> {
  try {
    const linkInfo = await fetch(`api/linkInfo?url=${encodeURIComponent(url)}`).then(res => res.json())
    return linkInfo
  } catch (err) {
    console.error(err)
    return { success: false, data: null }
  }
}
