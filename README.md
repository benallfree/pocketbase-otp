# PocketBase OTP Hook

This is a One Time Password (OTP) authentication hook for [PocketBase](https://pocketbase.io). It enables email-based OTP authentication for users.

## Why use One Time Passwords?

### Benefits

- **Enhanced Security**: OTPs provide an extra layer of security by requiring a temporary, unique code sent to the user's email. This reduces the risk of unauthorized access compared to static passwords.
- **No Need for Password Storage**: OTP authentication eliminates the need to store sensitive password hashes, reducing the potential for data breaches.
- **Easy to Use**: Users don't need to remember complex passwords, as each login generates a new code sent directly to their email.
- **Phishing Resistance**: Since OTPs are time-limited and single-use, they can help mitigate risks from phishing attacks. Even if an attacker gets the OTP, it becomes invalid after use or expiration.
- **Fits Temporary Access**: OTPs are ideal for temporary or one-time access scenarios, such as guest accounts, event-based logins, or quick signups without requiring a permanent password.

### Use Cases

- **Passwordless Authentication**: OTPs can serve as a standalone authentication method, removing the need for traditional passwords entirely.
- **Multi-Factor Authentication (MFA)**: OTPs can act as an additional factor in a multi-step authentication process, increasing the security of an account.
- **Temporary Access or Guest Accounts**: For platforms offering temporary services or guest accounts, OTPs provide a secure and quick login method without the need to create permanent credentials.
- **Low-Friction Onboarding**: OTPs offer an easier onboarding process for users who don't want to deal with password management, enhancing user experience for apps with quick signup requirements.

## Caveats and Drawbacks

- **Email Delays**: Since OTPs rely on email delivery, network issues or delays in sending emails can frustrate users trying to authenticate quickly.
- **Email Account Vulnerabilities**: The security of OTP authentication is heavily reliant on the user's email account being secure. If an email account is compromised, the attacker can intercept OTPs.
- **Single-Point Failure**: If email services are unavailable or if users don’t have access to their email, they cannot authenticate.
- **Limited Offline Use**: OTP authentication requires internet access for the user to retrieve their email, making it less ideal for situations where offline access is needed.
- **User Friction**: Constantly entering OTP codes may lead to user fatigue, especially in frequent-use applications, making it less convenient compared to persistent logins or biometric options.

## Installation

1. Install the package:

   ```bash
   npm install pocketbase-otp
   ```

2. Copy the migrations into your `pb_migrations`:

   ```bash
   cp node_modules/pocketbase-otp/pb_migrations pb_migrations
   ```

3. Copy the hook file into your `pb_hooks`::

   ```bash
   cp node_modules/pocketbase-otp/pb_hooks pb_hooks
   ```

## Usage

### Requesting a Code

First, make sure your PocketBase instance has SMTP configured and tested for sending emails.

To request an OTP code:

```javascript
const client = new PocketBase(...)
const res = await client.send(`/api/otp/auth`, {
  body: { email },
  method: 'POST',
})
```

The PocketBase instance will send the OTP code to the provided email address.

### Verifying the Code

Once the user receives the OTP code, use it to trade for the authentication token and user record:

```javascript
const res = await client.send(`/api/otp/verify`, {
  body: { email, code },
  method: 'POST',
})
client.authStore.save(res.token, res.record)
```

This will authenticate the PocketBase client using the OTP.

## License

MIT License
