# API HTTP

Base URL locale: `http://127.0.0.1:3333`

## Health

### `GET /health`

Réponse:

```json
{ "ok": true }
```

## Lookup

### `GET /v1/lookup?number=...`

Paramètre:
- `number`: string, formats libres (`+33 6 12 34 56 78`, `0612345678`, etc.)

Réponse si trouvé:

```json
{
  "found": true,
  "input": "+33 6 12 34 56 78",
  "digits": "612345678",
  "operatorCode": "XXXX",
  "operatorName": "Nom opérateur",
  "risk": {
    "score": 0,
    "flags": []
  },
  "requestCount": 12,
  "rangeStart": "612000000",
  "rangeEnd": "612999999",
  "sourceVersion": "2026-02-10"
}
```

Réponse si non trouvé:

```json
{
  "found": false,
  "input": "+33 6 12 34 56 78",
  "digits": "33612345678",
  "requestCount": 3
}
```

## Admin sync

### `POST /admin/sync/arcep`

Déclenche une sync complète ARCEP.

Réponse:

```json
{
  "ok": true,
  "operatorsRows": 1500,
  "rangesRows": 25000,
  "version": "2026-02-10"
}
```

## Admin stats

### `GET /admin/lookup/stats`

Query params:
- `limit` (default 100, min 1, max 1000)
- `flagged=true|false` (si `true`, filtre `risk_score > 0`)

Réponse:

```json
{
  "count": 2,
  "rows": [
    {
      "numberDigits": "612345678",
      "requestCount": 25,
      "found": true,
      "operatorCode": "XXXX",
      "operatorName": "Operator",
      "riskScore": 100,
      "riskFlags": ["KAV_OPERATOR"],
      "firstSeenAt": "2026-02-26T10:00:00.000Z",
      "lastSeenAt": "2026-02-26T15:00:00.000Z"
    }
  ]
}
```

## Documentation interactive

- Swagger UI: `GET /docs`
- Spécification: `GET /openapi.yaml`
