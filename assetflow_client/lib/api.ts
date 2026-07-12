import { z } from "zod"

const DEFAULT_API_URL = "http://localhost:8000"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_API_URL

export type ApiFieldError = {
  field: string
  message: string
}

export class ApiRequestError extends Error {
  status: number
  errors: ApiFieldError[]

  constructor(message: string, status: number, errors: ApiFieldError[] = []) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
    this.errors = errors
  }
}

type ApiRequestOptions<TBody, TResponse> = {
  path: string
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: TBody
  bodySchema?: z.ZodType<TBody>
  responseSchema: z.ZodType<TResponse>
  token?: string | null
  query?: Record<string, string | number | boolean | null | undefined>
}

const buildUrl = (
  path: string,
  query?: ApiRequestOptions<unknown, unknown>["query"]
) => {
  const url = new URL(path, `${API_BASE_URL}/`)

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

const readJson = async (response: Response) => {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new ApiRequestError("The server returned an invalid JSON response", response.status)
  }
}

export async function apiRequest<TBody, TResponse>({
  path,
  method = "GET",
  body,
  bodySchema,
  responseSchema,
  token,
  query,
}: ApiRequestOptions<TBody, TResponse>): Promise<TResponse> {
  const parsedBody = bodySchema && body !== undefined ? bodySchema.parse(body) : body

  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(parsedBody !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: parsedBody !== undefined ? JSON.stringify(parsedBody) : undefined,
  })

  const json = await readJson(response)

  if (!response.ok) {
    const errorBody = z
      .object({
        message: z.string().optional(),
        errors: z
          .array(
            z.object({
              field: z.string().default(""),
              message: z.string(),
            })
          )
          .optional(),
      })
      .safeParse(json)

    throw new ApiRequestError(
      errorBody.success ? errorBody.data.message || "Request failed" : "Request failed",
      response.status,
      errorBody.success ? errorBody.data.errors || [] : []
    )
  }

  return responseSchema.parse(json)
}
