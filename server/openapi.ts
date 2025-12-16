import { PARTNER_API_SCOPES, WEBHOOK_EVENT_TYPES, PARTNER_API_ERROR_CODES, PARTNER_API_RATE_LIMITS } from "@shared/schema";

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "ORBIT Partner API",
    description: `
## Overview
The ORBIT Partner API enables B2B integrations with the ORBIT Staffing Platform. Partners can access worker data, manage locations, retrieve analytics, and receive real-time webhook notifications.

## Authentication
All API requests (except /health and /scopes) require authentication via API Key header:
\`\`\`
X-API-Key: your_api_key_here
\`\`\`

## Rate Limiting
Rate limits are enforced per credential:
- **Sandbox**: 30/min, 1,000/day
- **Standard**: 60/min, 10,000/day
- **Premium**: 120/min, 50,000/day
- **Enterprise**: 300/min, 100,000/day

Rate limit headers are included in all responses:
- \`X-RateLimit-Limit\`: Maximum requests allowed
- \`X-RateLimit-Remaining\`: Remaining requests
- \`X-RateLimit-Reset\`: Unix timestamp when the limit resets

## Scopes
API credentials are granted specific scopes that control access to endpoints. Request the minimum scopes needed for your integration.

## Webhooks
Subscribe to real-time events for workers, jobs, timesheets, payroll, and invoices. All webhook payloads are signed with HMAC-SHA256.

## Support
For API support, contact: partners@orbitstaffing.io
    `.trim(),
    version: "1.0.0",
    contact: {
      name: "ORBIT Partner Support",
      email: "partners@orbitstaffing.io",
      url: "https://orbitstaffing.io",
    },
    license: {
      name: "Proprietary",
      url: "https://orbitstaffing.io/terms",
    },
  },
  servers: [
    {
      url: "https://orbitstaffing.io/api/partner/v1",
      description: "Production Server",
    },
    {
      url: "https://sandbox.orbitstaffing.io/api/partner/v1",
      description: "Sandbox Server (for testing)",
    },
  ],
  tags: [
    { name: "System", description: "Health and system endpoints" },
    { name: "Authentication", description: "Credential information" },
    { name: "Workers", description: "Worker management" },
    { name: "Locations", description: "Location management" },
    { name: "Analytics", description: "Platform analytics" },
    { name: "Billing", description: "Billing information" },
    { name: "Webhooks", description: "Webhook subscription management" },
    { name: "Bulk Operations", description: "Bulk import operations for workers, timesheets, and locations" },
    { name: "Exports", description: "Data export endpoints with CSV and JSON support" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        description: "Returns API health status. No authentication required.",
        operationId: "getHealth",
        security: [],
        responses: {
          "200": {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse",
                },
                example: {
                  status: "healthy",
                  version: "1.0.0",
                  timestamp: "2024-12-16T12:00:00.000Z",
                  service: "ORBIT Partner API",
                },
              },
            },
          },
        },
      },
    },
    "/scopes": {
      get: {
        tags: ["System"],
        summary: "List available scopes",
        description: "Returns all available permission scopes. No authentication required.",
        operationId: "getScopes",
        security: [],
        responses: {
          "200": {
            description: "Available scopes",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ScopesResponse",
                },
                example: {
                  scopes: PARTNER_API_SCOPES,
                  description: "Available permission scopes for Partner API access",
                },
              },
            },
          },
        },
      },
    },
    "/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current credential info",
        description: "Returns information about the authenticated API credential including scopes and rate limits.",
        operationId: "getMe",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          "200": {
            description: "Credential information",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CredentialInfo",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/workers": {
      get: {
        tags: ["Workers"],
        summary: "List workers",
        description: "Returns workers associated with the tenant. Requires `workers:read` scope.",
        operationId: "getWorkers",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of workers to return (max 100)",
            schema: { type: "integer", default: 100, maximum: 100 },
          },
        ],
        responses: {
          "200": {
            description: "List of workers",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WorkersResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/locations": {
      get: {
        tags: ["Locations"],
        summary: "List locations",
        description: "Returns locations for the franchise/tenant. Requires `locations:read` scope.",
        operationId: "getLocations",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          "200": {
            description: "List of locations",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LocationsResponse",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
      post: {
        tags: ["Locations"],
        summary: "Create location",
        description: "Creates a new location. Requires `locations:write` scope.",
        operationId: "createLocation",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateLocationRequest",
              },
              example: {
                name: "Downtown Office",
                addressLine1: "123 Main Street",
                city: "Austin",
                state: "TX",
                zipCode: "78701",
                latitude: 30.2672,
                longitude: -97.7431,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Location created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LocationResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/analytics": {
      get: {
        tags: ["Analytics"],
        summary: "Get analytics",
        description: "Returns API usage and platform analytics. Requires `analytics:read` scope.",
        operationId: "getAnalytics",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          "200": {
            description: "Analytics data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AnalyticsResponse",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/billing": {
      get: {
        tags: ["Billing"],
        summary: "Get billing info",
        description: "Returns billing configuration for the tenant. Requires `billing:read` scope.",
        operationId: "getBilling",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          "200": {
            description: "Billing information",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/BillingResponse",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/webhooks": {
      get: {
        tags: ["Webhooks"],
        summary: "List webhook subscriptions",
        description: "Returns all webhook subscriptions for the authenticated credential.",
        operationId: "getWebhooks",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          "200": {
            description: "List of webhook subscriptions",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WebhooksResponse",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
      post: {
        tags: ["Webhooks"],
        summary: "Create webhook subscription",
        description: "Creates a new webhook subscription. The secret is returned only once - save it immediately!",
        operationId: "createWebhook",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateWebhookRequest",
              },
              example: {
                url: "https://your-server.com/webhooks/orbit",
                events: ["worker.created", "worker.updated", "timesheet.approved"],
                description: "Production webhook for worker updates",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Webhook subscription created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WebhookCreatedResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/webhooks/{id}": {
      patch: {
        tags: ["Webhooks"],
        summary: "Update webhook subscription",
        description: "Updates an existing webhook subscription.",
        operationId: "updateWebhook",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Webhook subscription ID",
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateWebhookRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Webhook updated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WebhookResponse",
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
      delete: {
        tags: ["Webhooks"],
        summary: "Delete webhook subscription",
        description: "Permanently deletes a webhook subscription.",
        operationId: "deleteWebhook",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Webhook subscription ID",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Webhook deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Webhook subscription deleted" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/webhooks/{id}/test": {
      post: {
        tags: ["Webhooks"],
        summary: "Send test webhook",
        description: "Sends a test webhook payload to verify your endpoint is working.",
        operationId: "testWebhook",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Webhook subscription ID",
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Test webhook sent successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    statusCode: { type: "integer" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "502": {
            description: "Webhook delivery failed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    statusCode: { type: "integer" },
                    error: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/webhooks/{id}/logs": {
      get: {
        tags: ["Webhooks"],
        summary: "Get webhook delivery logs",
        description: "Returns delivery logs for a specific webhook subscription.",
        operationId: "getWebhookLogs",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Webhook subscription ID",
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "limit",
            in: "query",
            description: "Maximum number of logs to return (max 100)",
            schema: { type: "integer", default: 50, maximum: 100 },
          },
        ],
        responses: {
          "200": {
            description: "Webhook delivery logs",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WebhookLogsResponse",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/webhook-logs": {
      get: {
        tags: ["Webhooks"],
        summary: "Get all webhook logs",
        description: "Returns delivery logs for all webhook subscriptions belonging to this credential.",
        operationId: "getAllWebhookLogs",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Maximum number of logs to return (max 100)",
            schema: { type: "integer", default: 50, maximum: 100 },
          },
        ],
        responses: {
          "200": {
            description: "All webhook delivery logs",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WebhookLogsResponse",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/bulk/workers": {
      post: {
        tags: ["Bulk Operations"],
        summary: "Bulk import workers",
        description: "Import multiple workers at once. Supports up to 1000 workers per request. Use `transactional: true` for all-or-nothing mode.",
        operationId: "bulkImportWorkers",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BulkWorkersRequest" },
              example: {
                workers: [
                  { fullName: "John Smith", email: "john@example.com", phone: "555-0101", status: "approved" },
                  { fullName: "Jane Doe", email: "jane@example.com", phone: "555-0102", status: "pending_review" },
                ],
                transactional: false,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Bulk import results",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BulkImportResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/bulk/timesheets": {
      post: {
        tags: ["Bulk Operations"],
        summary: "Bulk import timesheets",
        description: "Import multiple timesheets at once. Supports up to 5000 timesheets per request.",
        operationId: "bulkImportTimesheets",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BulkTimesheetsRequest" },
              example: {
                timesheets: [
                  { workerId: "worker_123", clockInTime: "2024-12-16T08:00:00Z", clockOutTime: "2024-12-16T17:00:00Z", totalHoursWorked: "8.00" },
                  { workerId: "worker_456", clockInTime: "2024-12-16T09:00:00Z", clockOutTime: "2024-12-16T18:00:00Z", totalHoursWorked: "8.00" },
                ],
                transactional: false,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Bulk import results",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BulkImportResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/bulk/locations": {
      post: {
        tags: ["Bulk Operations"],
        summary: "Bulk import locations",
        description: "Import multiple locations at once. Supports up to 100 locations per request.",
        operationId: "bulkImportLocations",
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BulkLocationsRequest" },
              example: {
                locations: [
                  { name: "Downtown Office", locationCode: "DT001", addressLine1: "123 Main St", city: "Austin", state: "TX", zipCode: "78701" },
                  { name: "North Branch", locationCode: "NB001", addressLine1: "456 Oak Ave", city: "Austin", state: "TX", zipCode: "78758" },
                ],
                transactional: false,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Bulk import results",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BulkImportResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/export/workers": {
      get: {
        tags: ["Exports"],
        summary: "Export workers",
        description: "Export workers as JSON or CSV. Supports pagination with limit/offset.",
        operationId: "exportWorkers",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          { name: "format", in: "query", description: "Export format (json or csv)", schema: { type: "string", enum: ["json", "csv"], default: "json" } },
          { name: "limit", in: "query", description: "Maximum records to return (max 10000)", schema: { type: "integer", default: 1000, maximum: 10000 } },
          { name: "offset", in: "query", description: "Number of records to skip", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": {
            description: "Exported workers data",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ExportResponse" } },
              "text/csv": { schema: { type: "string", description: "CSV formatted data" } },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/export/timesheets": {
      get: {
        tags: ["Exports"],
        summary: "Export timesheets",
        description: "Export timesheets as JSON or CSV. Supports date range filtering.",
        operationId: "exportTimesheets",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          { name: "format", in: "query", description: "Export format (json or csv)", schema: { type: "string", enum: ["json", "csv"], default: "json" } },
          { name: "limit", in: "query", description: "Maximum records to return (max 10000)", schema: { type: "integer", default: 1000, maximum: 10000 } },
          { name: "offset", in: "query", description: "Number of records to skip", schema: { type: "integer", default: 0 } },
          { name: "startDate", in: "query", description: "Start date (ISO 8601)", schema: { type: "string", format: "date-time" } },
          { name: "endDate", in: "query", description: "End date (ISO 8601)", schema: { type: "string", format: "date-time" } },
        ],
        responses: {
          "200": {
            description: "Exported timesheets data",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ExportResponse" } },
              "text/csv": { schema: { type: "string", description: "CSV formatted data" } },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
    "/export/payroll": {
      get: {
        tags: ["Exports"],
        summary: "Export payroll records",
        description: "Export payroll records as JSON or CSV. Supports date range filtering.",
        operationId: "exportPayroll",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          { name: "format", in: "query", description: "Export format (json or csv)", schema: { type: "string", enum: ["json", "csv"], default: "json" } },
          { name: "limit", in: "query", description: "Maximum records to return (max 10000)", schema: { type: "integer", default: 1000, maximum: 10000 } },
          { name: "offset", in: "query", description: "Number of records to skip", schema: { type: "integer", default: 0 } },
          { name: "startDate", in: "query", description: "Pay period start date (ISO 8601)", schema: { type: "string", format: "date" } },
          { name: "endDate", in: "query", description: "Pay period end date (ISO 8601)", schema: { type: "string", format: "date" } },
        ],
        responses: {
          "200": {
            description: "Exported payroll data",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ExportResponse" } },
              "text/csv": { schema: { type: "string", description: "CSV formatted data" } },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "429": { $ref: "#/components/responses/RateLimitExceeded" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
        description: "API Key for Partner API authentication",
      },
    },
    responses: {
      BadRequest: {
        description: "Bad Request - Invalid input parameters",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { error: "Invalid request parameters" },
          },
        },
      },
      Unauthorized: {
        description: "Unauthorized - Missing or invalid API key",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { error: PARTNER_API_ERROR_CODES.MISSING_API_KEY.message, code: "MISSING_API_KEY" },
          },
        },
      },
      Forbidden: {
        description: "Forbidden - Insufficient permissions",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { error: PARTNER_API_ERROR_CODES.INSUFFICIENT_SCOPE.message, code: "INSUFFICIENT_SCOPE", requiredScope: "workers:read" },
          },
        },
      },
      NotFound: {
        description: "Not Found - Resource does not exist",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { error: "Resource not found" },
          },
        },
      },
      RateLimitExceeded: {
        description: "Too Many Requests - Rate limit exceeded",
        headers: {
          "X-RateLimit-Limit": {
            description: "Maximum requests allowed",
            schema: { type: "integer" },
          },
          "X-RateLimit-Remaining": {
            description: "Remaining requests in current window",
            schema: { type: "integer" },
          },
          "X-RateLimit-Reset": {
            description: "Unix timestamp when the limit resets",
            schema: { type: "integer" },
          },
        },
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { error: PARTNER_API_ERROR_CODES.RATE_LIMIT_MINUTE.message, code: "RATE_LIMIT_MINUTE" },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", description: "Error message" },
          code: { type: "string", description: "Error code" },
        },
        required: ["error"],
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["healthy", "degraded", "unhealthy"] },
          version: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
          service: { type: "string" },
        },
      },
      ScopesResponse: {
        type: "object",
        properties: {
          scopes: {
            type: "array",
            items: { type: "string", enum: PARTNER_API_SCOPES as unknown as string[] },
          },
          description: { type: "string" },
        },
      },
      CredentialInfo: {
        type: "object",
        properties: {
          credentialId: { type: "string", format: "uuid" },
          name: { type: "string" },
          environment: { type: "string", enum: ["sandbox", "production"] },
          scopes: {
            type: "array",
            items: { type: "string" },
          },
          rateLimits: {
            type: "object",
            properties: {
              perMinute: { type: "integer" },
              perDay: { type: "integer" },
              usedToday: { type: "integer" },
            },
          },
          franchiseId: { type: "string", format: "uuid", nullable: true },
          tenantId: { type: "string", format: "uuid", nullable: true },
        },
      },
      Worker: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          status: { type: "string", enum: ["active", "inactive", "pending", "terminated"] },
          jobTitle: { type: "string" },
          hireDate: { type: "string", format: "date" },
          hourlyRate: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      WorkersResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Worker" },
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer" },
              tenantId: { type: "string", format: "uuid" },
            },
          },
        },
      },
      Location: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          addressLine1: { type: "string" },
          addressLine2: { type: "string", nullable: true },
          city: { type: "string" },
          state: { type: "string" },
          zipCode: { type: "string" },
          latitude: { type: "number", format: "double" },
          longitude: { type: "number", format: "double" },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      LocationsResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Location" },
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer" },
            },
          },
        },
      },
      CreateLocationRequest: {
        type: "object",
        required: ["name", "addressLine1", "city", "state", "zipCode"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 255 },
          addressLine1: { type: "string" },
          addressLine2: { type: "string" },
          city: { type: "string" },
          state: { type: "string", minLength: 2, maxLength: 2 },
          zipCode: { type: "string" },
          latitude: { type: "number", format: "double" },
          longitude: { type: "number", format: "double" },
        },
      },
      LocationResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/Location" },
        },
      },
      AnalyticsResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              apiUsage: {
                type: "object",
                properties: {
                  totalRequests: { type: "integer" },
                  successfulRequests: { type: "integer" },
                  failedRequests: { type: "integer" },
                },
              },
              platform: {
                type: "object",
                properties: {
                  todayViews: { type: "integer" },
                  todayVisitors: { type: "integer" },
                  weekViews: { type: "integer" },
                },
              },
            },
          },
          meta: {
            type: "object",
            properties: {
              credentialId: { type: "string", format: "uuid" },
            },
          },
        },
      },
      BillingResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              credentialId: { type: "string", format: "uuid" },
              billingModel: { type: "string", enum: ["fixed", "revenue_share"] },
              billingTier: { type: "string", enum: ["startup", "growth", "enterprise"] },
              monthlyFlatFee: { type: "string" },
              revenueSharePercentage: { type: "string" },
            },
          },
        },
      },
      WebhookSubscription: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          url: { type: "string", format: "uri" },
          events: {
            type: "array",
            items: { type: "string", enum: WEBHOOK_EVENT_TYPES as unknown as string[] },
          },
          isActive: { type: "boolean" },
          description: { type: "string", nullable: true },
          totalDeliveries: { type: "integer" },
          successfulDeliveries: { type: "integer" },
          failedDeliveries: { type: "integer" },
          lastDeliveryAt: { type: "string", format: "date-time", nullable: true },
          lastSuccessAt: { type: "string", format: "date-time", nullable: true },
          lastFailureAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      WebhooksResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/WebhookSubscription" },
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer" },
              availableEvents: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
      CreateWebhookRequest: {
        type: "object",
        required: ["url", "events"],
        properties: {
          url: {
            type: "string",
            format: "uri",
            description: "HTTPS URL to receive webhook payloads",
          },
          events: {
            type: "array",
            items: { type: "string", enum: WEBHOOK_EVENT_TYPES as unknown as string[] },
            minItems: 1,
            description: "Event types to subscribe to",
          },
          description: {
            type: "string",
            description: "Optional description for this webhook",
          },
        },
      },
      WebhookCreatedResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              url: { type: "string", format: "uri" },
              secret: {
                type: "string",
                description: "Webhook signing secret (shown only once!)",
              },
              events: { type: "array", items: { type: "string" } },
              isActive: { type: "boolean" },
              description: { type: "string", nullable: true },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          message: { type: "string" },
        },
      },
      UpdateWebhookRequest: {
        type: "object",
        properties: {
          url: { type: "string", format: "uri" },
          events: {
            type: "array",
            items: { type: "string", enum: WEBHOOK_EVENT_TYPES as unknown as string[] },
            minItems: 1,
          },
          description: { type: "string" },
          isActive: { type: "boolean" },
        },
      },
      WebhookResponse: {
        type: "object",
        properties: {
          data: { $ref: "#/components/schemas/WebhookSubscription" },
        },
      },
      WebhookDeliveryLog: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          subscriptionId: { type: "string", format: "uuid" },
          event: { type: "string" },
          status: { type: "string", enum: ["pending", "success", "failed", "retrying"] },
          statusCode: { type: "integer", nullable: true },
          attemptCount: { type: "integer" },
          errorMessage: { type: "string", nullable: true },
          deliveredAt: { type: "string", format: "date-time", nullable: true },
          nextRetryAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      WebhookLogsResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/WebhookDeliveryLog" },
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer" },
              subscriptionId: { type: "string", format: "uuid" },
            },
          },
        },
      },
      BulkWorkersRequest: {
        type: "object",
        required: ["workers"],
        properties: {
          workers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                fullName: { type: "string", description: "Worker full name (required)" },
                email: { type: "string", format: "email" },
                phone: { type: "string" },
                status: { type: "string", enum: ["pending_review", "approved", "rejected"] },
                hourlyWage: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zipCode: { type: "string" },
              },
              required: ["fullName"],
            },
            maxItems: 1000,
            description: "Array of worker objects to import (max 1000)",
          },
          transactional: {
            type: "boolean",
            default: false,
            description: "If true, all records must validate or none are imported",
          },
        },
      },
      BulkTimesheetsRequest: {
        type: "object",
        required: ["timesheets"],
        properties: {
          timesheets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                workerId: { type: "string", format: "uuid", description: "Worker ID (required)" },
                assignmentId: { type: "string", format: "uuid" },
                clockInTime: { type: "string", format: "date-time" },
                clockOutTime: { type: "string", format: "date-time" },
                totalHoursWorked: { type: "string" },
                billableHours: { type: "string" },
                status: { type: "string", enum: ["draft", "submitted", "approved", "rejected"] },
              },
              required: ["workerId"],
            },
            maxItems: 5000,
            description: "Array of timesheet objects to import (max 5000)",
          },
          transactional: {
            type: "boolean",
            default: false,
            description: "If true, all records must validate or none are imported",
          },
        },
      },
      BulkLocationsRequest: {
        type: "object",
        required: ["locations"],
        properties: {
          locations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Location name (required)" },
                locationCode: { type: "string", description: "Unique location code (required)" },
                addressLine1: { type: "string", description: "Street address (required)" },
                addressLine2: { type: "string" },
                city: { type: "string", description: "City (required)" },
                state: { type: "string", description: "State (required)" },
                zipCode: { type: "string", description: "ZIP code (required)" },
                latitude: { type: "number", format: "double" },
                longitude: { type: "number", format: "double" },
              },
              required: ["name", "locationCode", "addressLine1", "city", "state", "zipCode"],
            },
            maxItems: 100,
            description: "Array of location objects to import (max 100)",
          },
          transactional: {
            type: "boolean",
            default: false,
            description: "If true, all records must validate or none are imported",
          },
        },
      },
      BulkImportResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", description: "True if all records imported successfully" },
          mode: { type: "string", enum: ["partial", "transactional"], description: "Import mode used" },
          totalSubmitted: { type: "integer", description: "Number of records submitted" },
          totalSuccess: { type: "integer", description: "Number of records successfully imported" },
          totalFailed: { type: "integer", description: "Number of records that failed" },
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                row: { type: "integer", description: "1-based row number" },
                success: { type: "boolean" },
                id: { type: "string", format: "uuid", description: "Created record ID (if successful)" },
                error: { type: "string", description: "Error message (if failed)" },
              },
            },
          },
        },
      },
      ExportResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { type: "object" },
            description: "Array of exported records",
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer", description: "Number of records returned" },
              limit: { type: "integer", description: "Limit used" },
              offset: { type: "integer", description: "Offset used" },
              format: { type: "string", enum: ["json", "csv"] },
              startDate: { type: "string", format: "date-time", description: "Start date filter (if used)" },
              endDate: { type: "string", format: "date-time", description: "End date filter (if used)" },
            },
          },
        },
      },
    },
  },
};
