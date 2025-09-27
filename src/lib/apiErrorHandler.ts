export class APIError extends Error {
  status?: number;
  statusText?: string;
  data?: any;

  constructor(
    message: string,
    status?: number,
    statusText?: string,
    data?: any
  ) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export function handleApiError(error: any): APIError {
  if (error.response) {
    // Server responded with error status
    const { status, statusText, data } = error.response;
    return new APIError(
      data?.message || error.message || "Request failed",
      status,
      statusText,
      data
    );
  } else if (error.request) {
    // Network error
    return new APIError(
      "Network error: Unable to connect to server",
      0,
      "Network Error"
    );
  } else {
    // Other error
    return new APIError(error.message || "Unknown error occurred");
  }
}

export function getErrorMessage(error: any): string {
  if (error instanceof APIError) {
    return error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "An unexpected error occurred";
}

export function isUnauthorized(error: any): boolean {
  return error?.response?.status === 401;
}
