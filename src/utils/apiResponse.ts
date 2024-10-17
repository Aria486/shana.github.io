export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export function successResponse<T>(
  data: T,
  message = "Success"
): ApiResponse<T> {
  return {
    status: "success",
    data,
    message
  };
}

export function errorResponse(
  message = "An error occurred"
): ApiResponse<null> {
  return {
    status: "error",
    data: null,
    message
  };
}
