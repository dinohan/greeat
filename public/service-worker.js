const API_ORIGIN = 'https://api-greeat.52g.gs'
const API_REQUEST = 'GREEAT_API_REQUEST'

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== API_REQUEST) {
    return false
  }

  fetchApi(message.path).then(sendResponse)
  return true
})

async function fetchApi(path) {
  const url = createApiUrl(path)

  if (!url) {
    return {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      error: 'Invalid API path',
    }
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    })
    const body = await parseBody(response)

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body,
      error: response.ok ? undefined : response.statusText,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      error: error instanceof Error ? error.message : 'Unknown network error',
    }
  }
}

function createApiUrl(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) {
    return undefined
  }

  const url = new URL(path, API_ORIGIN)
  return url.origin === API_ORIGIN ? url : undefined
}

async function parseBody(response) {
  const text = await response.text()

  if (!text) {
    return undefined
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return text
  }

  try {
    return JSON.parse(text)
  } catch (_error) {
    return text
  }
}
