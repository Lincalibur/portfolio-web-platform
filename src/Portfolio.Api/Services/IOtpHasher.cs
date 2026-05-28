namespace Portfolio.Api.Services;

public interface IOtpHasher
{
    string Hash(string otp, string email);

    bool Verify(string otp, string email, string storedHash);
}
