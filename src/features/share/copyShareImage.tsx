import React from 'react'

import satori, { init as initSatori } from 'satori/wasm'
import initYoga from 'yoga-wasm-web'

import { Menu } from '@/types/Menu'
import { Status } from '@/types/Status'

const CARD_WIDTH = 1200
const YOGA_WASM_URL = '/yoga.wasm'
const SHARE_FONT_FAMILY = 'Pretendard'
const SHARE_FONT_URLS = {
  regular: '/fonts/Pretendard-Regular.woff',
  semibold: '/fonts/Pretendard-SemiBold.woff',
  bold: '/fonts/Pretendard-Bold.woff',
} as const
const CARD_PADDING_TOP = 40
const CARD_PADDING_BOTTOM = 18
const CARD_PADDING_HORIZONTAL = 48
const DATE_FONT_SIZE = 56
const DATE_LINE_HEIGHT = 1.05
const HEADER_GAP = 16
const HEADER_DIVIDER_HEIGHT = 4
const HEADER_MARGIN_BOTTOM = 20
const MENU_ROW_GAP = 24
const MENU_CARD_PADDING = 24
const MENU_CARD_GAP = 18
const MENU_BADGE_SIZE = 48
const MENU_NAME_LINE_HEIGHT = 1.15
const MENU_TEXT_GAP = 6
const MENU_GROUP_FONT_SIZE = 17
const MENU_GROUP_LINE_HEIGHT = 1.2
const MENU_IMAGE_HEIGHT = 228
const MENU_META_FONT_SIZE = 22
const MENU_META_LINE_HEIGHT = 1.1

type ShareResult = 'copied' | 'downloaded'

interface ShareImageInput {
  date: Date
  dateString: string
  menus: Menu[]
  statuses: Status[]
}

interface ShareMenu extends Menu {
  imageDataUrl: string | null
}

const DEFAULT_MENU_COLORS = {
  G: '#FFB71E',
  R: '#FF6D2E',
  E: '#00CD7C',
} satisfies Record<Menu['id'], string>

const DEFAULT_IDS: Menu['id'][] = ['G', 'R', 'E']

let fontDataPromise: Promise<{
  regular: ArrayBuffer
  semibold: ArrayBuffer
  bold: ArrayBuffer
}> | null = null
let satoriReadyPromise: Promise<void> | null = null

const formatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
})

export async function shareMealImage(
  input: ShareImageInput
): Promise<ShareResult> {
  const blobPromise = createShareImageBlob(input)

  try {
    await copyBlobToClipboard(blobPromise)
    return 'copied'
  } catch (error) {
    console.warn('Image copy failed, downloading instead.', error)
    const blob = await blobPromise
    downloadBlob(blob, `greeat-${input.dateString}.png`)
    return 'downloaded'
  }
}

async function createShareImageBlob(
  input: ShareImageInput
): Promise<Blob> {
  const normalizedMenus = normalizeMenus(input.menus)
  const cardHeight = getCardHeight(normalizedMenus)

  const [, fontData, menus] = await Promise.all([
    ensureSatoriReady(),
    getShareFontData(),
    Promise.all(
      normalizedMenus.map(async (menu) => ({
        ...menu,
        imageDataUrl: await getImageDataUrl(menu.image),
      }))
    ),
  ])

  const svg = await satori(
    <ShareCard
      date={input.date}
      menus={menus}
    />,
    {
      width: CARD_WIDTH,
      height: cardHeight,
      fonts: [
        {
          name: SHARE_FONT_FAMILY,
          data: fontData.regular,
          style: 'normal',
          weight: 400,
        },
        {
          name: SHARE_FONT_FAMILY,
          data: fontData.semibold,
          style: 'normal',
          weight: 600,
        },
        {
          name: SHARE_FONT_FAMILY,
          data: fontData.bold,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )

  return svgToPngBlob(svg, cardHeight)
}

function ShareCard({
  date,
  menus,
}: {
  date: Date
  menus: ShareMenu[]
}) {
  return (
    <div
      lang="ko-KR"
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        backgroundColor: '#f7f3ea',
        backgroundImage:
          'linear-gradient(140deg, #f7f0e4 0%, #fffdf7 45%, #f2eee5 100%)',
        padding: `${CARD_PADDING_TOP}px ${CARD_PADDING_HORIZONTAL}px ${CARD_PADDING_BOTTOM}px`,
        color: '#1f1f1f',
        fontFamily: SHARE_FONT_FAMILY,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: HEADER_GAP,
          marginBottom: HEADER_MARGIN_BOTTOM,
        }}
      >
        <div
          style={{
            fontSize: DATE_FONT_SIZE,
            fontWeight: 700,
            lineHeight: DATE_LINE_HEIGHT,
            letterSpacing: '-0.04em',
          }}
        >
          {formatter.format(date)}
        </div>
        <div
          style={{
            height: HEADER_DIVIDER_HEIGHT,
            width: 132,
            borderRadius: 9999,
            backgroundColor: '#1f1f1f',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'stretch',
          gap: MENU_ROW_GAP,
        }}
      >
        {menus.map((menu) => (
          <div
            key={menu.id}
            style={{
              display: 'flex',
              flex: 1,
              height: '100%',
              flexDirection: 'column',
              gap: MENU_CARD_GAP,
              borderRadius: 28,
              backgroundColor: 'rgba(255, 255, 255, 0.86)',
              padding: MENU_CARD_PADDING,
              border: '1px solid rgba(31, 31, 31, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  height: MENU_BADGE_SIZE,
                  width: MENU_BADGE_SIZE,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 16,
                  backgroundColor: menu.color,
                  color: '#fff',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {menu.id}
              </div>
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',
                  gap: MENU_TEXT_GAP,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    overflow: 'hidden',
                    color: '#23211d',
                    fontSize: getMenuNameFontSize(menu.name),
                    fontWeight: 700,
                    lineHeight: MENU_NAME_LINE_HEIGHT,
                    letterSpacing: '-0.04em',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {menu.name}
                </div>
                <div
                  style={{
                    fontSize: MENU_GROUP_FONT_SIZE,
                    lineHeight: MENU_GROUP_LINE_HEIGHT,
                    fontWeight: 500,
                    color: '#6a655d',
                  }}
                >
                  {menu.group}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                height: MENU_IMAGE_HEIGHT,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderRadius: 22,
                backgroundColor: `${menu.color}22`,
              }}
            >
              {menu.imageDataUrl ? (
                <img
                  src={menu.imageDataUrl}
                  alt={menu.name}
                  width="100%"
                  height="100%"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center center',
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6a655d',
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  사진 없음
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: MENU_META_FONT_SIZE,
                lineHeight: MENU_META_LINE_HEIGHT,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: '#6a655d',
                }}
              >
                예상 열량
              </div>
              <div
                style={{
                  fontWeight: 700,
                }}
              >
                {`${menu.calorie} kcal`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function getShareFontData() {
  if (!fontDataPromise) {
    fontDataPromise = Promise.all([
      fetchFontData(SHARE_FONT_URLS.regular),
      fetchFontData(SHARE_FONT_URLS.semibold),
      fetchFontData(SHARE_FONT_URLS.bold),
    ])
      .then(([regular, semibold, bold]) => ({
        regular,
        semibold,
        bold,
      }))
      .catch((error) => {
        fontDataPromise = null
        throw error
      })
  }

  return fontDataPromise
}

async function ensureSatoriReady() {
  if (!satoriReadyPromise) {
    satoriReadyPromise = fetch(YOGA_WASM_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch yoga.wasm.')
        }

        const yoga = await initYoga(await response.arrayBuffer())
        initSatori(yoga)
      })
      .catch((error) => {
        satoriReadyPromise = null
        throw error
      })
  }

  return satoriReadyPromise
}

async function copyBlobToClipboard(blobPromise: Promise<Blob>) {
  if (
    typeof ClipboardItem === 'undefined' ||
    typeof navigator === 'undefined' ||
    !navigator.clipboard?.write
  ) {
    throw new Error('Clipboard image copy is not supported.')
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blobPromise,
    }),
  ])
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = fileName
  anchor.click()

  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 0)
}

async function svgToPngBlob(svg: string, cardHeight: number) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas 2D context is unavailable.')
  }

  canvas.width = CARD_WIDTH
  canvas.height = cardHeight

  context.fillStyle = '#f7f3ea'
  context.fillRect(0, 0, CARD_WIDTH, cardHeight)

  const svgBlob = new Blob([svg], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const objectUrl = URL.createObjectURL(svgBlob)

  try {
    const image = await loadImage(objectUrl)
    context.drawImage(image, 0, 0, CARD_WIDTH, cardHeight)

    const pngBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png')
    })

    if (!pngBlob) {
      throw new Error('Failed to convert share image to PNG.')
    }

    return pngBlob
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () =>
      reject(new Error('Failed to load generated SVG image.'))
    image.src = src
  })
}

async function getImageDataUrl(imageUrl?: string) {
  if (!imageUrl) {
    return null
  }

  try {
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error('Failed to fetch menu image.')
    }

    return blobToDataUrl(await response.blob())
  } catch (error) {
    console.warn('Unable to embed menu image in share card.', error)
    return null
  }
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Failed to read blob as data URL.'))
        return
      }

      resolve(reader.result)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function normalizeMenus(menus: Menu[]) {
  if (menus.length) {
    return menus.map((menu) => ({
      ...menu,
      calorie: normalizeNumber(menu.calorie),
      color: menu.color || DEFAULT_MENU_COLORS[menu.id],
      group: menu.group || '정보 없음',
      name: menu.name || '메뉴 정보 없음',
    }))
  }

  return DEFAULT_IDS.map((id) => ({
    id,
    name: '메뉴 정보 없음',
    group: '아직 공개되지 않았어요',
    calorie: 0,
    image: undefined,
    color: DEFAULT_MENU_COLORS[id],
  }))
}

function normalizeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

async function fetchFontData(url: string) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch share font: ${url}`)
  }

  return response.arrayBuffer()
}

function getMenuNameFontSize(name: string) {
  if (name.length >= 14) {
    return 21
  }

  if (name.length >= 11) {
    return 24
  }

  return 28
}

function getCardHeight(menus: Menu[]) {
  const tallestMenuCard = menus.reduce((maxHeight, menu) => {
    const nameFontSize = getMenuNameFontSize(menu.name)
    const menuTextHeight = Math.max(
      MENU_BADGE_SIZE,
      nameFontSize * MENU_NAME_LINE_HEIGHT +
        MENU_TEXT_GAP +
        MENU_GROUP_FONT_SIZE * MENU_GROUP_LINE_HEIGHT
    )

    const menuMetaHeight = MENU_META_FONT_SIZE * MENU_META_LINE_HEIGHT
    const cardHeight =
      MENU_CARD_PADDING * 2 +
      MENU_CARD_GAP * 2 +
      menuTextHeight +
      MENU_IMAGE_HEIGHT +
      menuMetaHeight

    return Math.max(maxHeight, cardHeight)
  }, 0)

  const headerHeight =
    DATE_FONT_SIZE * DATE_LINE_HEIGHT +
    HEADER_GAP +
    HEADER_DIVIDER_HEIGHT +
    HEADER_MARGIN_BOTTOM

  return Math.ceil(
    CARD_PADDING_TOP + headerHeight + tallestMenuCard + CARD_PADDING_BOTTOM
  )
}
