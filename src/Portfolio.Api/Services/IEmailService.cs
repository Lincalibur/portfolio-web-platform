namespace Portfolio.Api.Services;

public interface IEmailService
{
    Task SendOtpAsync(string toEmail, string fullName, string otpCode, CancellationToken cancellationToken = default);
}
