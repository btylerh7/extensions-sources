import {
  Chapter,
  ChapterDetails,
  // HomeSection,
  // // HomeSection,
  LanguageCode,
  Manga,
  MangaStatus,
  MangaTile,
  //PagedResults,
  // SearchRequest,
  // TagSection,
} from 'paperback-extensions-common'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {
  //   const image = $('.thumbnail').attr('src')
  const image = $('.hide').find('img').attr('src')
  const ul = $('.manga-info')
  const titles: string[] = []
  const title = $('h3', ul).text().trim()
  titles.push(title)

  const rating = 0
  const statusLink = $('.btn-success').attr('href')
  console.log(statusLink)
  let status: MangaStatus
  switch (statusLink!) {
    case '/manga-incomplete.html':
      status = MangaStatus.ONGOING
      break
    case '/manga-completed.html':
      status = MangaStatus.COMPLETED
      break
  }
  const desc = $('.row > h3').find('p').text()

  return createManga({
    id: mangaId,
    titles: titles,
    image: image ?? 'https://i.imgur.com/GYUxEX8.png',
    status: status!,
    desc,
    rating,
  })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
  const chapters: Chapter[] = []
  const chapterLinks = $('td').find('a')

  for (let chapter of chapterLinks.toArray()) {
    const id = decodeURI(chapter!.attribs!.href!) //Decode link to chapter
    const chapNum = chapter!.attribs!.text!.split('Chapter ')![1]

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
  const links = $('.chapter-content').find('img')

  for (const img of links.toArray()) {
    let page = img!.attribs!.src
    // let page = img!.attribs!['data-src']
    //   ? img!.attribs!['data-src']
    //   : img!.attribs!.src!
    pages.push(page!)
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
  const results = $('.bodythumb').find('.thumb-item-flow')

  for (let result of results.toArray()) {
    const mangaId = $('.thumb-wrapper > a', result).attr('href')
    const image = $('.img-in-ratio', result).attr('data-bg')
    const title = $('.title-thumb', result).text()

    tiles.push(
      createMangaTile({
        id: mangaId!,
        image: image ?? 'https://i.imgur.com/GYUxEX8.png',
        title: createIconText({
          text: title,
        }),
      })
    )
  }
  return tiles
}
