using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using Portfolio.Api.Configuration;

namespace Portfolio.Api.Services;

public class EmailService(
    IOptions<SmtpSettings> smtpOptions,
    ILogger<EmailService> logger,
    IHostEnvironment environment) : IEmailService
{
    private readonly SmtpSettings _smtp = smtpOptions.Value;

    public async Task SendOtpAsync(
        string toEmail,
        string fullName,
        string otpCode,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_smtp.Host))
        {
            logger.LogWarning(
                "SMTP not configured. OTP for {Email} ({Name}): {Otp} (development only)",
                toEmail,
                fullName,
                otpCode);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_smtp.FromDisplayName, _smtp.FromAddress));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = "Your portfolio access code";
        message.Body = new TextPart("plain")
        {
            Text = $"Hello {fullName},\n\nYour verification code is: {otpCode}\n\nThis code expires shortly. Do not share it.\n"
        };

        using var client = new SmtpClient();
        await client.ConnectAsync(_smtp.Host, _smtp.Port, SecureSocketOptions.StartTlsWhenAvailable, cancellationToken);

        if (!string.IsNullOrEmpty(_smtp.UserName))
        {
            await client.AuthenticateAsync(_smtp.UserName, _smtp.Password ?? string.Empty, cancellationToken);
        }

        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);

        if (environment.IsDevelopment())
        {
            logger.LogInformation("OTP email sent to {Email}", toEmail);
        }
    }
}
