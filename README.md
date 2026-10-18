# M3 - Lab 5

Patient database webpage with a vanilla JavaScript client and a Node.js API.

## Structure

- `server1`: webpage with an Insert button, SQL textarea and response area.
- `server2`: HTTP API connected to MySQL.

The Insert button adds the four required patients and creates the InnoDB table if missing. Repeated clicks add another four rows. SQL queries are URL-encoded and sent through GET. Results and errors appear as plain text.

## Hosting

The client and API run on separate HTTPS origins.

| Setting | Client | API |
| --- | --- | --- |
| Render service | Static Site | Web Service |
| Root directory | Repository root | `server2` |
| Build command | None | `npm ci` |
| Publish directory | `server1` | Not applicable |
| Start command | Not applicable | `npm start` |

`ApiConfig.baseUrl` in `server1/js/config.js` holds the API origin. Local previews use `http://localhost:3000`. The hosted value is currently empty.

`ALLOWED_ORIGIN` specifies the client origin. Database credentials are stored in server environment variables. Aiven connections use `DB_SSL_CA_FILE=ca.pem` for TLS certificate verification.

## Database permissions

- CREATE account: table setup.
- SELECT/INSERT account: record insertion.
- SELECT-only account: GET queries.

## Verification

Local integration checks covered HTTP routes, URL encoding, responses and CORS with an in-memory repository. TLS configuration checks passed. Live database permissions and hosted connections have not yet been verified.

## Attribution

OpenAI ChatGPT/Codex assisted with client development, API integration, fixes and testing.
