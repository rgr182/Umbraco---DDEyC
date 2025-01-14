# Umbraco---DDEyC 

### Run analytics migration before starting the project locally
`dotnet ef database update --context AnalyticsContext`

## This project includes the API configuration for user authentication in the appsettings.json file:

` "ApiSettings": { "AuthApiUrl": "https://ddeycapi.duckdns.org/api/Auth/login"} `

## AuthApiUrl
- Description: URL of the authentication endpoint.
- Usage: Used to send login requests with user credentials.
## Customization
You can change the URL directly in appsettings.json as needed.
