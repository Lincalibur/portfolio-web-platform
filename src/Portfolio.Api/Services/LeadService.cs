using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Contracts;
using Portfolio.Api.Data;
using Portfolio.Api.Entities;

namespace Portfolio.Api.Services;

public class LeadService(
    AppDbContext dbContext,
    IOtpHasher otpHasher,
    IEmailService emailService,
    ITokenService tokenService) : ILeadService
{
    private static readonly EmailAddressAttribute EmailValidator = new();

    public async Task<RequestAccessResponse> RequestAccessAsync(
        RequestAccessRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (!EmailValidator.IsValid(email))
        {
            throw new ValidationException("A valid email address is required.");
        }

        var otp = Random.Shared.Next(100000, 999999).ToString();
        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        var lead = await dbContext.VisitorLeads
            .FirstOrDefaultAsync(l => l.Email == email, cancellationToken);

        if (lead is null)
        {
            lead = new VisitorLead
            {
                Id = Guid.NewGuid(),
                FullName = request.FullName.Trim(),
                Email = email,
                Company = request.Company?.Trim(),
                CreatedAt = DateTime.UtcNow
            };
            dbContext.VisitorLeads.Add(lead);
        }
        else
        {
            lead.FullName = request.FullName.Trim();
            lead.Company = request.Company?.Trim();
        }

        lead.OtpHash = otpHasher.Hash(otp, email);
        lead.OtpExpiresAt = expiresAt;
        lead.IsVerified = false;
        lead.VerifiedAt = null;

        await dbContext.SaveChangesAsync(cancellationToken);
        await emailService.SendOtpAsync(email, lead.FullName, otp, cancellationToken);

        return new RequestAccessResponse("If the email is valid, a verification code has been sent.");
    }

    public async Task<VerifyOtpResponse?> VerifyOtpAsync(
        VerifyOtpRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var lead = await dbContext.VisitorLeads
            .FirstOrDefaultAsync(l => l.Email == email, cancellationToken);

        if (lead?.OtpHash is null ||
            lead.OtpExpiresAt is null ||
            lead.OtpExpiresAt < DateTime.UtcNow ||
            !otpHasher.Verify(request.Code.Trim(), email, lead.OtpHash))
        {
            return null;
        }

        lead.IsVerified = true;
        lead.VerifiedAt = DateTime.UtcNow;
        lead.OtpHash = null;
        lead.OtpExpiresAt = null;

        await dbContext.SaveChangesAsync(cancellationToken);

        var identity = new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, lead.Id.ToString()),
            new Claim(ClaimTypes.Email, lead.Email),
            new Claim(ClaimTypes.Name, lead.FullName),
            new Claim("resume", "read")
        ]);

        var (token, expiresAt) = tokenService.CreateAccessToken(identity);
        return new VerifyOtpResponse(token, expiresAt);
    }
}
