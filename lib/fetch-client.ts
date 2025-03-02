/**
 * Custom fetch client that automatically includes credentials with all requests
 * to ensure authentication cookies are sent to the API
 */

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

/**
 * Enhanced fetch client that automatically includes credentials
 * and handles common request configurations
 */
export async function fetchClient(url: string, options: FetchOptions = {}) {
  // Add query parameters if provided
  let fullUrl = url;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });

    if (searchParams.toString()) {
      fullUrl += `?${searchParams.toString()}`;
    }
  }

  // Set default options for all requests
  const defaultOptions: RequestInit = {
    credentials: "include", // Always send cookies with requests
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Merge provided options with defaults
  const fetchOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(fullUrl, fetchOptions);

  // Handle common error cases
  if (!response.ok) {
    const error = new Error(`API request failed: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).response = response;
    throw error;
  }

  return response.json();
}

/**
 * GET request helper
 */
export function get<T = any>(
  url: string,
  params?: Record<string, string>
): Promise<T> {
  return fetchClient(url, { method: "GET", params });
}

/**
 * POST request helper
 */
export function post<T = any>(
  url: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  return fetchClient(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PUT request helper
 */
export function put<T = any>(
  url: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  return fetchClient(url, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PATCH request helper
 */
export function patch<T = any>(
  url: string,
  data?: any,
  options?: FetchOptions
): Promise<T> {
  return fetchClient(url, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * DELETE request helper
 */
export function del<T = any>(url: string, options?: FetchOptions): Promise<T> {
  return fetchClient(url, {
    method: "DELETE",
    ...options,
  });
}
