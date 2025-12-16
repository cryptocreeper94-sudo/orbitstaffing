"""
ORBIT Partner API SDK v1.0.0

Official Python SDK for the ORBIT Staffing Partner API

License: MIT
Copyright: 2024-2025 ORBIT Staffing powered by DarkWave Studios LLC

Documentation: https://orbitstaffing.io/api/docs
Support: api-support@orbitstaffing.io
"""

import hashlib
import hmac
import json
import time
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urlencode

try:
    import requests
except ImportError:
    requests = None

try:
    import httpx
except ImportError:
    httpx = None

__version__ = "1.0.0"
__all__ = ["OrbitPartnerAPI", "OrbitAPIError", "OrbitWebhookValidator"]


class OrbitAPIError(Exception):
    """Exception raised for ORBIT API errors."""

    def __init__(
        self,
        message: str,
        code: str = "UNKNOWN_ERROR",
        status_code: int = 500,
        details: Optional[Dict] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}

    def __str__(self):
        return f"OrbitAPIError({self.code}): {self.message}"


class OrbitWebhookValidator:
    """Utility class for validating webhook signatures."""

    @staticmethod
    def verify_signature(
        payload: Union[str, bytes, Dict], signature: str, secret: str
    ) -> bool:
        """
        Verify the webhook signature.

        Args:
            payload: The raw webhook payload
            signature: The X-Webhook-Signature header value
            secret: Your webhook secret

        Returns:
            True if signature is valid, False otherwise
        """
        if isinstance(payload, dict):
            payload = json.dumps(payload, separators=(",", ":"))
        if isinstance(payload, str):
            payload = payload.encode("utf-8")

        expected_signature = hmac.new(
            secret.encode("utf-8"), payload, hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(f"sha256={expected_signature}", signature)


class OrbitPartnerAPI:
    """
    ORBIT Partner API SDK Client.

    Example usage:
        >>> api = OrbitPartnerAPI(
        ...     api_key="orbit_pk_...",
        ...     api_secret="orbit_sk_...",
        ...     sandbox=True
        ... )
        >>> workers = api.get_workers(limit=10)
        >>> print(workers)
    """

    VERSION = __version__
    DEFAULT_BASE_URL = "https://orbitstaffing.io/api/partner/v1"

    def __init__(
        self,
        api_key: str,
        api_secret: str,
        sandbox: bool = False,
        base_url: Optional[str] = None,
        timeout: int = 30,
        retries: int = 3,
        retry_delay: float = 1.0,
        debug: bool = False,
    ):
        """
        Initialize the ORBIT Partner API client.

        Args:
            api_key: Your ORBIT Partner API key (starts with orbit_pk_)
            api_secret: Your ORBIT Partner API secret (starts with orbit_sk_)
            sandbox: Enable sandbox/test mode (uses mock data)
            base_url: Override the API base URL
            timeout: Request timeout in seconds
            retries: Number of retry attempts for failed requests
            retry_delay: Base delay between retries (multiplied by attempt number)
            debug: Enable debug logging
        """
        if not api_key or not api_secret:
            raise ValueError("API key and secret are required")

        self.api_key = api_key
        self.api_secret = api_secret
        self.sandbox = sandbox
        self.base_url = base_url or self.DEFAULT_BASE_URL
        self.timeout = timeout
        self.retries = retries
        self.retry_delay = retry_delay
        self.debug = debug

        if requests:
            self._session = requests.Session()
            self._http_client = "requests"
        elif httpx:
            self._session = httpx.Client(timeout=timeout)
            self._http_client = "httpx"
        else:
            raise ImportError(
                "Either 'requests' or 'httpx' package is required. "
                "Install with: pip install requests"
            )

        self._log_debug(f"SDK initialized (using {self._http_client})")

    def _log_debug(self, message: str, **kwargs):
        """Log debug message if debug mode is enabled."""
        if self.debug:
            print(f"[ORBIT SDK] {message}", kwargs if kwargs else "")

    def _get_headers(self) -> Dict[str, str]:
        """Get authentication headers."""
        return {
            "X-API-Key": self.api_key,
            "X-API-Secret": self.api_secret,
            "Content-Type": "application/json",
            "User-Agent": f"orbit-partner-sdk-python/{self.VERSION}",
        }

    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Make an API request with retry logic.

        Args:
            method: HTTP method (GET, POST, PATCH, DELETE)
            endpoint: API endpoint path
            data: Request body data (for POST/PATCH)
            params: Query parameters

        Returns:
            API response data

        Raises:
            OrbitAPIError: If the request fails
        """
        url = f"{self.base_url}{endpoint}"

        if params:
            params = {k: v for k, v in params.items() if v is not None}

        last_error = None
        for attempt in range(self.retries + 1):
            try:
                self._log_debug(f"Request attempt {attempt + 1}", method=method, url=url)

                if self._http_client == "requests":
                    response = self._session.request(
                        method=method,
                        url=url,
                        headers=self._get_headers(),
                        json=data if data else None,
                        params=params,
                        timeout=self.timeout,
                    )
                    response_data = response.json() if response.text else {}
                    status_code = response.status_code
                else:
                    response = self._session.request(
                        method=method,
                        url=url,
                        headers=self._get_headers(),
                        json=data if data else None,
                        params=params,
                    )
                    response_data = response.json() if response.text else {}
                    status_code = response.status_code

                if status_code >= 400:
                    raise OrbitAPIError(
                        message=response_data.get("error", response_data.get("message", "API request failed")),
                        code=response_data.get("code", "UNKNOWN_ERROR"),
                        status_code=status_code,
                        details=response_data.get("details"),
                    )

                self._log_debug(f"Request successful", status=status_code)
                return response_data

            except OrbitAPIError:
                raise
            except Exception as e:
                last_error = e
                should_retry = attempt < self.retries

                if should_retry:
                    delay = self.retry_delay * (attempt + 1)
                    self._log_debug(f"Retrying after error: {e}", delay=delay)
                    time.sleep(delay)

        raise OrbitAPIError(
            message=f"Request failed after {self.retries + 1} attempts: {last_error}",
            code="REQUEST_FAILED",
            status_code=500,
        )

    def get_health(self) -> Dict[str, Any]:
        """Check API health status."""
        return self._request("GET", "/health")

    def get_scopes(self) -> Dict[str, Any]:
        """Get available API scopes."""
        return self._request("GET", "/scopes")

    def get_me(self) -> Dict[str, Any]:
        """Get current API credential information."""
        return self._request("GET", "/me")

    def get_workers(
        self,
        page: int = 1,
        limit: int = 50,
        status: Optional[str] = None,
        skills: Optional[str] = None,
        location: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Get list of workers.

        Args:
            page: Page number (default: 1)
            limit: Items per page (default: 50, max: 100)
            status: Filter by status (active, inactive, pending)
            skills: Filter by skills (comma-separated)
            location: Filter by location

        Returns:
            Paginated list of workers
        """
        return self._request(
            "GET",
            "/workers",
            params={"page": page, "limit": limit, "status": status, "skills": skills, "location": location},
        )

    def get_worker(self, worker_id: str) -> Dict[str, Any]:
        """Get a specific worker by ID."""
        return self._request("GET", f"/workers/{worker_id}")

    def get_locations(
        self,
        page: int = 1,
        limit: int = 50,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Get list of work locations.

        Args:
            page: Page number (default: 1)
            limit: Items per page (default: 50, max: 100)
            status: Filter by status
            search: Search by name or address

        Returns:
            Paginated list of locations
        """
        return self._request(
            "GET",
            "/locations",
            params={"page": page, "limit": limit, "status": status, "search": search},
        )

    def get_location(self, location_id: str) -> Dict[str, Any]:
        """Get a specific location by ID."""
        return self._request("GET", f"/locations/{location_id}")

    def create_location(
        self,
        name: str,
        address: str,
        city: str,
        state: str,
        zip_code: str,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Create a new work location.

        Args:
            name: Location name
            address: Street address
            city: City
            state: State code
            zip_code: ZIP code
            **kwargs: Additional location properties

        Returns:
            Created location data
        """
        data = {
            "name": name,
            "address": address,
            "city": city,
            "state": state,
            "zipCode": zip_code,
            **kwargs,
        }
        return self._request("POST", "/locations", data=data)

    def update_location(self, location_id: str, **data) -> Dict[str, Any]:
        """Update a location."""
        return self._request("PATCH", f"/locations/{location_id}", data=data)

    def get_jobs(
        self,
        page: int = 1,
        limit: int = 50,
        status: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        location_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Get list of jobs/assignments.

        Args:
            page: Page number
            limit: Items per page
            status: Filter by status
            start_date: Filter by start date (ISO 8601)
            end_date: Filter by end date (ISO 8601)
            location_id: Filter by location

        Returns:
            Paginated list of jobs
        """
        return self._request(
            "GET",
            "/jobs",
            params={
                "page": page,
                "limit": limit,
                "status": status,
                "startDate": start_date,
                "endDate": end_date,
                "locationId": location_id,
            },
        )

    def get_job(self, job_id: str) -> Dict[str, Any]:
        """Get a specific job by ID."""
        return self._request("GET", f"/jobs/{job_id}")

    def get_timesheets(
        self,
        page: int = 1,
        limit: int = 50,
        worker_id: Optional[str] = None,
        job_id: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Get list of timesheets.

        Args:
            page: Page number
            limit: Items per page
            worker_id: Filter by worker
            job_id: Filter by job
            start_date: Filter by start date
            end_date: Filter by end date
            status: Filter by status

        Returns:
            Paginated list of timesheets
        """
        return self._request(
            "GET",
            "/timesheets",
            params={
                "page": page,
                "limit": limit,
                "workerId": worker_id,
                "jobId": job_id,
                "startDate": start_date,
                "endDate": end_date,
                "status": status,
            },
        )

    def get_timesheet(self, timesheet_id: str) -> Dict[str, Any]:
        """Get a specific timesheet by ID."""
        return self._request("GET", f"/timesheets/{timesheet_id}")

    def approve_timesheet(self, timesheet_id: str, **data) -> Dict[str, Any]:
        """Approve a timesheet."""
        return self._request("POST", f"/timesheets/{timesheet_id}/approve", data=data)

    def get_payroll(
        self,
        page: int = 1,
        limit: int = 50,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Get payroll records.

        Args:
            page: Page number
            limit: Items per page
            start_date: Filter by start date
            end_date: Filter by end date
            status: Filter by status

        Returns:
            Paginated list of payroll records
        """
        return self._request(
            "GET",
            "/payroll",
            params={
                "page": page,
                "limit": limit,
                "startDate": start_date,
                "endDate": end_date,
                "status": status,
            },
        )

    def get_payroll_record(self, payroll_id: str) -> Dict[str, Any]:
        """Get a specific payroll record by ID."""
        return self._request("GET", f"/payroll/{payroll_id}")

    def get_analytics(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        metrics: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Get analytics data.

        Args:
            start_date: Start date for analytics period
            end_date: End date for analytics period
            metrics: Comma-separated list of metrics to include

        Returns:
            Analytics data
        """
        return self._request(
            "GET",
            "/analytics",
            params={"startDate": start_date, "endDate": end_date, "metrics": metrics},
        )

    def get_billing(
        self,
        page: int = 1,
        limit: int = 50,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Get billing information and invoices.

        Args:
            page: Page number
            limit: Items per page
            start_date: Filter by start date
            end_date: Filter by end date

        Returns:
            Billing data with invoices
        """
        return self._request(
            "GET",
            "/billing",
            params={"page": page, "limit": limit, "startDate": start_date, "endDate": end_date},
        )

    def get_invoice(self, invoice_id: str) -> Dict[str, Any]:
        """Get a specific invoice by ID."""
        return self._request("GET", f"/billing/invoices/{invoice_id}")

    def get_webhooks(self, page: int = 1, limit: int = 50) -> Dict[str, Any]:
        """
        Get list of webhooks.

        Args:
            page: Page number
            limit: Items per page

        Returns:
            Paginated list of webhooks
        """
        return self._request("GET", "/webhooks", params={"page": page, "limit": limit})

    def get_webhook(self, webhook_id: str) -> Dict[str, Any]:
        """Get a specific webhook by ID."""
        return self._request("GET", f"/webhooks/{webhook_id}")

    def create_webhook(
        self,
        url: str,
        events: List[str],
        secret: Optional[str] = None,
        description: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Create a new webhook.

        Args:
            url: Webhook endpoint URL (must be HTTPS)
            events: List of event types to subscribe to
            secret: Webhook secret for signature verification
            description: Optional description
            headers: Custom headers to include in webhook requests

        Returns:
            Created webhook data
        """
        data = {
            "url": url,
            "events": events,
            "secret": secret,
            "description": description,
            "headers": headers,
        }
        return self._request("POST", "/webhooks", data={k: v for k, v in data.items() if v is not None})

    def update_webhook(self, webhook_id: str, **data) -> Dict[str, Any]:
        """
        Update a webhook.

        Args:
            webhook_id: Webhook ID
            **data: Fields to update

        Returns:
            Updated webhook data
        """
        return self._request("PATCH", f"/webhooks/{webhook_id}", data=data)

    def delete_webhook(self, webhook_id: str) -> Dict[str, Any]:
        """Delete a webhook."""
        return self._request("DELETE", f"/webhooks/{webhook_id}")

    def test_webhook(self, webhook_id: str, event_type: str = "test.ping") -> Dict[str, Any]:
        """
        Send a test webhook event.

        Args:
            webhook_id: Webhook ID
            event_type: Event type to send (default: test.ping)

        Returns:
            Test result
        """
        return self._request("POST", f"/webhooks/{webhook_id}/test", data={"eventType": event_type})

    def get_webhook_logs(
        self, webhook_id: str, page: int = 1, limit: int = 50
    ) -> Dict[str, Any]:
        """
        Get webhook delivery logs.

        Args:
            webhook_id: Webhook ID
            page: Page number
            limit: Items per page

        Returns:
            Paginated webhook logs
        """
        return self._request(
            "GET", f"/webhooks/{webhook_id}/logs", params={"page": page, "limit": limit}
        )

    def reset_sandbox(self) -> Dict[str, Any]:
        """
        Reset sandbox data to initial state.
        Only available for sandbox credentials.

        Returns:
            Reset confirmation

        Raises:
            OrbitAPIError: If not in sandbox mode
        """
        if not self.sandbox:
            raise OrbitAPIError(
                "Sandbox reset only available in sandbox mode",
                code="INVALID_OPERATION",
                status_code=400,
            )
        return self._request("POST", "/sandbox/reset")

    def close(self):
        """Close the HTTP session."""
        if hasattr(self, "_session"):
            self._session.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


if __name__ == "__main__":
    print(f"ORBIT Partner API SDK v{__version__}")
    print("Usage:")
    print("  from orbit_partner_sdk import OrbitPartnerAPI")
    print("  api = OrbitPartnerAPI('your_api_key', 'your_api_secret')")
    print("  workers = api.get_workers()")
