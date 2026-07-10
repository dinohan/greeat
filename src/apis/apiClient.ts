const API_ORIGIN = 'https://api-greeat.52g.gs'
const API_REQUEST = 'GREEAT_API_REQUEST'

type ChromeRuntime = {
  id?: string
  lastError?: {
    message?: string
  }
  sendMessage: (
    message: unknown,
    callback: (response: unknown) => void
  ) => void
}

type ChromeGlobal = typeof globalThis & {
  chrome?: {
    runtime?: ChromeRuntime
  }
}

interface ApiProxyResponse<T> {
  ok: boolean
  status: number
  statusText: string
  body?: T
  error?: string
}

export async function fetchGreeatApi<T>(path: string) {
  const runtime = getExtensionRuntime()

  if (runtime) {
    return fetchViaServiceWorker<T>(runtime, path)
  }

  return fetchDirectly<T>(path)
}

function getExtensionRuntime() {
  const runtime = (globalThis as ChromeGlobal).chrome?.runtime

  if (runtime?.id && typeof runtime.sendMessage === 'function') {
    return runtime
  }

  return undefined
}

async function fetchViaServiceWorker<T>(
  runtime: ChromeRuntime,
  path: string
) {
  const response = await sendMessage<ApiProxyResponse<T>>(runtime, {
    type: API_REQUEST,
    path,
  })

  if (!response?.ok) {
    throw new Error(
      response?.error || `Greeat API request failed: ${response?.status || 0}`
    )
  }

  return response.body as T
}

function sendMessage<T>(runtime: ChromeRuntime, message: unknown) {
  return new Promise<T>((resolve, reject) => {
    runtime.sendMessage(message, (response) => {
      const lastError = runtime.lastError

      if (lastError) {
        reject(new Error(lastError.message || 'Extension message failed'))
        return
      }

      resolve(response as T)
    })
  })
}

async function fetchDirectly<T>(path: string) {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Greeat API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}
