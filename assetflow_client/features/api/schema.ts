import { z } from "zod"

export const apiEnvelopeSchema = <TData extends z.ZodType>(data: TData) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data,
  })

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const paginatedSchema = <TItem extends z.ZodType>(item: TItem) =>
  z.object({
    items: z.array(item),
    pagination: paginationSchema,
  })
