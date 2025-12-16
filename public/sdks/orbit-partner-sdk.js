/**
 * ORBIT Partner API SDK v1.0.0
 * 
 * Official JavaScript/Node.js SDK for the ORBIT Staffing Partner API
 * Compatible with browser and Node.js environments
 * 
 * @license MIT
 * @copyright 2024-2025 ORBIT Staffing powered by DarkWave Studios LLC
 * 
 * Documentation: https://orbitstaffing.io/api/docs
 * Support: api-support@orbitstaffing.io
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.OrbitPartnerAPI = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  class OrbitAPIError extends Error {
    constructor(message, code, statusCode, details = null) {
      super(message);
      this.name = 'OrbitAPIError';
      this.code = code;
      this.statusCode = statusCode;
      this.details = details;
    }
  }

  class OrbitPartnerAPI {
    static VERSION = '1.0.0';
    static DEFAULT_BASE_URL = 'https://orbitstaffing.io/api/partner/v1';
    static SANDBOX_BASE_URL = 'https://orbitstaffing.io/api/partner/v1';

    constructor(apiKey, apiSecret, options = {}) {
      if (!apiKey || !apiSecret) {
        throw new Error('API key and secret are required');
      }

      this.apiKey = apiKey;
      this.apiSecret = apiSecret;
      this.sandbox = options.sandbox || false;
      this.baseUrl = options.baseUrl || OrbitPartnerAPI.DEFAULT_BASE_URL;
      this.timeout = options.timeout || 30000;
      this.retries = options.retries || 3;
      this.retryDelay = options.retryDelay || 1000;
      this.debug = options.debug || false;

      this._logDebug('SDK initialized', { sandbox: this.sandbox, baseUrl: this.baseUrl });
    }

    _logDebug(message, data = {}) {
      if (this.debug) {
        console.log(`[ORBIT SDK] ${message}`, data);
      }
    }

    _getAuthHeaders() {
      return {
        'X-API-Key': this.apiKey,
        'X-API-Secret': this.apiSecret,
        'Content-Type': 'application/json',
        'User-Agent': `orbit-partner-sdk-js/${OrbitPartnerAPI.VERSION}`,
      };
    }

    async _request(method, endpoint, data = null, queryParams = null) {
      let url = `${this.baseUrl}${endpoint}`;
      
      if (queryParams) {
        const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const options = {
        method,
        headers: this._getAuthHeaders(),
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
      }

      let lastError = null;
      for (let attempt = 0; attempt <= this.retries; attempt++) {
        try {
          this._logDebug(`Request attempt ${attempt + 1}`, { method, url });
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.timeout);
          options.signal = controller.signal;

          const response = await fetch(url, options);
          clearTimeout(timeoutId);

          const responseData = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new OrbitAPIError(
              responseData.error || responseData.message || 'API request failed',
              responseData.code || 'UNKNOWN_ERROR',
              response.status,
              responseData.details || null
            );
          }

          this._logDebug('Request successful', { status: response.status });
          return responseData;

        } catch (error) {
          lastError = error;
          
          if (error.name === 'AbortError') {
            lastError = new OrbitAPIError('Request timeout', 'TIMEOUT', 408);
          }

          const shouldRetry = 
            attempt < this.retries &&
            (error.statusCode >= 500 || error.name === 'AbortError' || error.code === 'ECONNRESET');

          if (shouldRetry) {
            this._logDebug(`Retrying after error`, { error: error.message, attempt });
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
          }
        }
      }

      throw lastError;
    }

    async getHealth() {
      return this._request('GET', '/health');
    }

    async getScopes() {
      return this._request('GET', '/scopes');
    }

    async getMe() {
      return this._request('GET', '/me');
    }

    async getWorkers(params = {}) {
      const { page = 1, limit = 50, status, skills, location } = params;
      return this._request('GET', '/workers', null, { page, limit, status, skills, location });
    }

    async getWorker(workerId) {
      return this._request('GET', `/workers/${workerId}`);
    }

    async getLocations(params = {}) {
      const { page = 1, limit = 50, status, search } = params;
      return this._request('GET', '/locations', null, { page, limit, status, search });
    }

    async getLocation(locationId) {
      return this._request('GET', `/locations/${locationId}`);
    }

    async createLocation(data) {
      return this._request('POST', '/locations', data);
    }

    async updateLocation(locationId, data) {
      return this._request('PATCH', `/locations/${locationId}`, data);
    }

    async getJobs(params = {}) {
      const { page = 1, limit = 50, status, startDate, endDate, locationId } = params;
      return this._request('GET', '/jobs', null, { page, limit, status, startDate, endDate, locationId });
    }

    async getJob(jobId) {
      return this._request('GET', `/jobs/${jobId}`);
    }

    async getTimesheets(params = {}) {
      const { page = 1, limit = 50, workerId, jobId, startDate, endDate, status } = params;
      return this._request('GET', '/timesheets', null, { page, limit, workerId, jobId, startDate, endDate, status });
    }

    async getTimesheet(timesheetId) {
      return this._request('GET', `/timesheets/${timesheetId}`);
    }

    async approveTimesheet(timesheetId, data = {}) {
      return this._request('POST', `/timesheets/${timesheetId}/approve`, data);
    }

    async getPayroll(params = {}) {
      const { page = 1, limit = 50, startDate, endDate, status } = params;
      return this._request('GET', '/payroll', null, { page, limit, startDate, endDate, status });
    }

    async getPayrollRecord(payrollId) {
      return this._request('GET', `/payroll/${payrollId}`);
    }

    async getAnalytics(params = {}) {
      const { startDate, endDate, metrics } = params;
      return this._request('GET', '/analytics', null, { startDate, endDate, metrics });
    }

    async getBilling(params = {}) {
      const { startDate, endDate, page = 1, limit = 50 } = params;
      return this._request('GET', '/billing', null, { startDate, endDate, page, limit });
    }

    async getInvoice(invoiceId) {
      return this._request('GET', `/billing/invoices/${invoiceId}`);
    }

    async getWebhooks(params = {}) {
      const { page = 1, limit = 50 } = params;
      return this._request('GET', '/webhooks', null, { page, limit });
    }

    async getWebhook(webhookId) {
      return this._request('GET', `/webhooks/${webhookId}`);
    }

    async createWebhook(data) {
      const { url, events, secret, description, headers } = data;
      return this._request('POST', '/webhooks', { url, events, secret, description, headers });
    }

    async updateWebhook(webhookId, data) {
      return this._request('PATCH', `/webhooks/${webhookId}`, data);
    }

    async deleteWebhook(webhookId) {
      return this._request('DELETE', `/webhooks/${webhookId}`);
    }

    async testWebhook(webhookId, eventType = 'test.ping') {
      return this._request('POST', `/webhooks/${webhookId}/test`, { eventType });
    }

    async getWebhookLogs(webhookId, params = {}) {
      const { page = 1, limit = 50 } = params;
      return this._request('GET', `/webhooks/${webhookId}/logs`, null, { page, limit });
    }

    async resetSandbox() {
      if (!this.sandbox) {
        throw new OrbitAPIError('Sandbox reset only available in sandbox mode', 'INVALID_OPERATION', 400);
      }
      return this._request('POST', '/sandbox/reset');
    }

    static verifyWebhookSignature(payload, signature, secret) {
      if (typeof require === 'function') {
        const crypto = require('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
          .digest('hex');
        return `sha256=${expectedSignature}` === signature;
      }
      
      console.warn('Webhook signature verification requires Node.js crypto module');
      return true;
    }
  }

  OrbitPartnerAPI.OrbitAPIError = OrbitAPIError;

  return OrbitPartnerAPI;
}));
