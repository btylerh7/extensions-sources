import {
  Chapter,
  ChapterDetails,
  // HomeSection,
  LanguageCode,
  Manga,
  MangaStatus,
  MangaTile,
  //PagedResults,
  // SearchRequest,
  // TagSection,
  // Tag,
} from 'paperback-extensions-common'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {
  const titles: string[] = [
    $('.post-title').find('h1').first().text().split(' ')[0]!,
  ]
  const image = $('.summary_image').find('img').attr('data-src')
  let status = MangaStatus.UNKNOWN //All manga is listed as ongoing
  const author = $('author-content').find('a').first().text()
  const artist = $('artist-content').find('a').first().text()

  return createManga({
    id: mangaId,
    titles: titles,
    image: image ?? 'https://i.imgur.com/GYUxEX8.png',
    rating: 0,
    status: status,
    author: author,
    artist: artist,
    //   tags: tagSection,
    // desc,
    // hentai
  })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = []
  const chapterLinks = $('.page-content-listing.single-page').find('li')

  for (let href of chapterLinks.toArray()) {
    const id = $('a', href).text().trim()
    const chapNum = $('a', href).text().replace(/第|話/g, '')
    chapters.push(
      createChapter({
        id,
        mangaId,
        chapNum: Number(chapNum),
        langCode: LanguageCode.JAPANESE,
      })
    )
  }

  return chapters
}

export const parseChapterDetails = (
  $: CheerioStatic,
  mangaId: string,
  chapterId: string
): ChapterDetails => {
  const pages: string[] = []
  const links = $('.reading-content').find('img')

  for (const img of links.toArray()) {
    let page = img!.attribs!['data-src']
      ? img!.attribs!['data-src'].trim()
      : img!.attribs!.src!
    pages.push(page)
  }
  return createChapterDetails({
    id: chapterId,
    mangaId,
    pages,
    longStrip: false,
  })
}

export const parseSearchRequest = ($: CheerioStatic) => {
  const tiles: MangaTile[] = []
  const results = $('.tab-content-wrap').find('.row.c-tabs-item__content')

  for (let result of results.toArray()) {
    // const id = article.attribs.class[0].split('-')[1]
    const mangaId = $(result)
      .find('.h4')
      .find('a')
      .first()
      .attr('href')
      ?.split('manga/')[1]!
    const image = $(result).find('img')?.first().attr('data-src') ?? ''
    const title = $(result).find('.h4').first().text().split(' ')[0]!

    tiles.push(
      createMangaTile({
        id: mangaId,
        image: image,
        title: createIconText({
          text: title,
        }),
      })
    )
  }
  return tiles
}

//   export const parseHomeSections = ($: CheerioStatic): MangaTile[] => {
//     const manga: MangaTile[] = []
//     const results = $('center').find('article')

//     for (let article of results.toArray()) {
//       // const id = article.attribs.class[0].split('-')[1]
//       const mangaId = decodeURI(
//         $('.featured-thumb', article).find('a')!.attr('href')!
//       ).split('/')[1]!
//       const image = $(article).find('img')?.first().attr('src') ?? ''
//       const title = $(article).find('.entry-title > a').text()

//       manga.push(
//         createMangaTile({
//           id: mangaId,
//           image: image,
//           title: createIconText({
//             text: title,
//           }),
//         })
//       )
//     }
//     return manga
//   }

//   export const parseTags = ($: CheerioSelector): TagSection[] => {
//     const tags: Tag[] = []
//     const data = $('select').find('option')
//     for (const option of data.toArray()) {
//       const id = decodeURI($(option).attr('value')!)
//       const label = $(option).text()
//       // if (!id || !label) continue
//       tags.push({ id: id, label: label })
//     }
//     tags.shift()
//     const tagSection: TagSection[] = [
//       createTagSection({
//         id: '0',
//         label: 'genres',
//         tags: tags.map((tag) => createTag(tag)),
//       }),
//     ]
//     return tagSection
//   }
