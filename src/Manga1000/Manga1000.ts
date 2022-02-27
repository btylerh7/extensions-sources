/* eslint-disable linebreak-style */
import {
  Chapter,
  ChapterDetails,
  ContentRating,
  HomeSection,
  // LanguageCode,
  Manga,
  // MangaUpdates,
  PagedResults,
  SearchRequest,
  // Section,
  Source,
  // TagSection,
  // Request,
  // Response,
  SourceInfo,
  TagType,
} from 'paperback-extensions-common'
import {
  parseMangaDetails,
  parseChapters,
  parseChapterDetails,
  parseSearchRequest,
  parseHomeSections,
} from './Manga1000Parser'

export const M1000_DOMAIN = 'https://mangapro.top'
const headers = {
  'content-type': 'application/x-www-form-urlencoded',
  Referer: `${M1000_DOMAIN}`,
}
const method = 'GET'

export const Manga1000Info: SourceInfo = {
  version: '1.0',
  name: 'Manga1000',
  icon: 'logo.png',
  author: 'btylerh7',
  authorWebsite: 'https://github.com/btylerh7',
  description: 'Extension that pulls manga from Manga1000',
  contentRating: ContentRating.EVERYONE,
  websiteBaseURL: M1000_DOMAIN,
  sourceTags: [
    {
      text: 'Japanese',
      type: TagType.GREY,
    },
  ],
}

export class Manga1000 extends Source {
  readonly cookies = [
    createCookie({
      name: 'isAdult',
      value: '1',
      domain: `https://manga1000.top`,
    }),
  ]
  override getCloudflareBypassRequest() {
    return createRequestObject({
      url: `${M1000_DOMAIN}`,
      method,
    })
  }
  requestManager = createRequestManager({
    requestsPerSecond: 4,
    requestTimeout: 15000,
  })
  override getMangaShareUrl(mangaId: string): string {
    return `${M1000_DOMAIN}/${mangaId}/`
  }
  async getMangaDetails(mangaId: string): Promise<Manga> {
    const request = createRequestObject({
      url: encodeURI(`${M1000_DOMAIN}/${mangaId}`),
      method,
      headers,
      cookies: this.cookies,
    })
    const data = await this.requestManager.schedule(request, 1)
    let $ = this.cheerio.load(data.data)

    return parseMangaDetails($, mangaId)
  }
  async getChapters(mangaId: string): Promise<Chapter[]> {
    const request = createRequestObject({
      url: encodeURI(`${M1000_DOMAIN}/${mangaId}`),
      method,
      headers,
    })
    const data = await this.requestManager.schedule(request, 1)
    let $ = this.cheerio.load(data.data)

    return parseChapters($, mangaId)
  }
  async getChapterDetails(
    mangaId: string,
    chapterId: string
  ): Promise<ChapterDetails> {
    const request = createRequestObject({
      url: encodeURI(`${M1000_DOMAIN}/${chapterId}`),
      method,
      headers,
    })
    const data = await this.requestManager.schedule(request, 1)
    let $ = this.cheerio.load(data.data)

    return parseChapterDetails($, mangaId, chapterId)
  }
  async getSearchResults(
    query: SearchRequest,
    metadata: any
  ): Promise<PagedResults> {
    let page: number = metadata?.page ?? 1

    const request = createRequestObject({
      url: encodeURI(`${M1000_DOMAIN}/?s=${query.title}`),
      method,
      headers,
    })
    const data = await this.requestManager.schedule(request, 1)
    let $ = this.cheerio.load(data.data)
    const manga = parseSearchRequest($)
    metadata = manga.length > 0 ? { page: page + 1 } : undefined

    return createPagedResults({
      results: manga,
      metadata,
    })
  }
  override async getHomePageSections(
    sectionCallback: (section: HomeSection) => void
  ): Promise<void> {
    const sections = [
      {
        sectionId: createHomeSection({
          id: 'latestManga',
          title: 'Latest Manga Updates',
          view_more: false,
        }),
        url: M1000_DOMAIN,
      },
      {
        sectionId: createHomeSection({
          id: 'top-manga',
          title: 'Top Manga',
          view_more: false,
        }),
        url: `${M1000_DOMAIN}/searchlist/`,
        selector: "('center').find('article')",
      },
    ]

    for (let section of sections) {
      const request = createRequestObject({
        url: section.url,
        method: 'GET',
        cookies: this.cookies,
      })

      let response = await this.requestManager.schedule(request, 1)
      let $ = this.cheerio.load(response.data)
      section.sectionId.items = parseHomeSections($)
      sectionCallback(section.sectionId)
    }
  }
}
