namespace Portfolio.Api.Contracts;

public record RequestAccessRequest(string FullName, string Email, string? Company);

public record RequestAccessResponse(string Message);

public record VerifyOtpRequest(string Email, string Code);

public record VerifyOtpResponse(string AccessToken, DateTime ExpiresAt);
