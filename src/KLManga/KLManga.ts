/* eslint-disable linebreak-style */
import {
  Chapter,
  ChapterDetails,
  ContentRating,
  // HomeSection,
  //   LanguageCode,
  Manga,
  // MangaUpdates,
  PagedResults,
  SearchRequest,
  Source,
  // TagSection,
  //   Request,
  //   Response,
  SourceInfo,
  TagType,
} from 'paperback-extensions-common'
import {
  parseMangaDetails,
  parseChapters,
  parseChapterDetails,
  parseSearchRequest,
} from './KLMangaParser'

export const KLM_DOMAIN = 'https://klmag.net'
const headers = {
  'content-type': 'application/x-www-form-urlencoded',
  Referer: 'https://klmag.net/',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}
const method = 'GET'

export const KLMangaInfo: SourceInfo = {
  version: '1.0',
  name: 'KLManga',
  icon: 'logo.ico',
  author: 'btylerh7',
  authorWebsite: 'https://github.com/btylerh7',
  description: 'Extension that pulls manga from KLManga',
  contentRating: ContentRating.EVERYONE,
  websiteBaseURL: KLM_DOMAIN,
  sourceTags: [
    {
      text: 'Japanese',
      type: TagType.GREY,
    },
  ],
}

export class KLManga extends Source {
  readonly cookies = [
    createCookie({
      name: 'isAdult',
      value: '1',
      domain: `https://klmag.net`,
    }),
  ]
  override getCloudflareBypassRequest() {
    return createRequestObject({
      url: `${KLM_DOMAIN}`,
      method,
      headers,
    })
  }
  requestManager = createRequestManager({
    requestsPerSecond: 4,
    requestTimeout: 20000,
  })
  //   override getMangaShareUrl(mangaId: string): string {
  //     return `${KLM_DOMAIN}/${mangaId}/`
  //   }

  //   fetch("https://h4.klimv1.xyz/images2/20210903/6131f75a99389_6131f75af070c.jpg", {
  //     "headers": {
  //       "sec-ch-ua": "\"Chromium\";v=\"98\", \" Not A;Brand\";v=\"99\"",
  //       "sec-ch-ua-mobile": "?0",
  //       "sec-ch-ua-platform": "\"macOS\"",
  //       "Referer": "https://klmag.net/",
  //       "Referrer-Policy": "strict-origin-when-cross-origin"
  //     },
  //     "body": null,
  //     "method": "GET"
  //   });

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: encodeURI(`${KLM_DOMAIN}/${mangaId}?PageSpeed=0`),
      method,
      headers,
      cookies: this.cookies,
    })
    const data = await this.requestManager.schedule(request, 3)
    let $ = this.cheerio.load(data.data)

    return parseMangaDetails($, mangaId)
  }
  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: `${KLM_DOMAIN}/${mangaId}`,
      method,
      headers,
      cookies: this.cookies,
    })
    const data = await this.requestManager.schedule(request, 1)
    let $ = await this.cheerio.load(data.data)

    const chapterList = parseChapters($, mangaId)
    return chapterList
  }
  async getChapterDetails(
    mangaId: string,
    chapterId: string
  ): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: `${KLM_DOMAIN}/${chapterId}`,
      method,
      headers,
      cookies: this.cookies,
    })
    const data = await this.requestManager.schedule(request, 1)
    let $ = await this.cheerio.load(data.data)

    return parseChapterDetails($, mangaId, chapterId)
  }
  async getSearchResults(
    query: SearchRequest,
    metadata: any
  ): Promise<PagedResults> {
    let page
    if (typeof metadata === 'object' && metadata.page) {
      page = metadata.page
    } else {
      // If there is no current page, this must mean this is the first page.
      page = 1
    }

    const request = createRequestObject({
      url: encodeURI(
        `${KLM_DOMAIN}/manga-list.html?listType=pagination&page=${page}?name=${query}`
      ),
      method,
      headers,
      cookies: this.cookies,
    })
    const data = await this.requestManager.schedule(request, 1)
    let $ = await this.cheerio.load(data.data)
    const manga = parseSearchRequest($)
    metadata = manga.length > 0 ? { page: page + 1 } : undefined

    return createPagedResults({
      results: manga,
      metadata,
    })
  }
}
