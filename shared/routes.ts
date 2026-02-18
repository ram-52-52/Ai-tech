import { z } from 'zod';
import { insertBlogSchema, blogs, trends } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  blogs: {
    list: {
      method: 'GET' as const,
      path: '/api/blogs' as const,
      responses: {
        200: z.array(z.custom<typeof blogs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/blogs/:id' as const,
      responses: {
        200: z.custom<typeof blogs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    getBySlug: {
      method: 'GET' as const,
      path: '/api/blogs/slug/:slug' as const,
      responses: {
        200: z.custom<typeof blogs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/blogs' as const,
      input: insertBlogSchema,
      responses: {
        201: z.custom<typeof blogs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/blogs/:id' as const,
      input: insertBlogSchema.partial(),
      responses: {
        200: z.custom<typeof blogs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/blogs/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/blogs/generate' as const,
      input: z.object({
        topic: z.string().optional(), // Optional, if not provided will fetch trends
      }),
      responses: {
        201: z.custom<typeof blogs.$inferSelect>(),
        500: errorSchemas.internal,
      },
    }
  },
  trends: {
    list: {
      method: 'GET' as const,
      path: '/api/trends' as const,
      responses: {
        200: z.array(z.custom<typeof trends.$inferSelect>()),
      },
    },
    refresh: {
      method: 'POST' as const,
      path: '/api/trends/refresh' as const,
      responses: {
        200: z.array(z.custom<typeof trends.$inferSelect>()),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
