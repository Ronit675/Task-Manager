const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'

const apiRequest = async (
  path,
  { method = 'GET', body, token, headers: customHeaders } = {},
) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...customHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    if (typeof payload === 'string' && payload.trim()) {
      throw new Error(payload.trim())
    }

    throw new Error(payload?.message || 'Request failed')
  }

  return payload
}

export { apiBaseUrl, apiRequest }
