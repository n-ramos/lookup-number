# Scoring risque KAV

## Règle active

Si `operatorCode` appartient à `FR_KAV_OPERATORS`:
- `score = 100`
- `flags` contient `KAV_OPERATOR`

Sinon:
- `score = 0`
- `flags = []`

## Emplacement

- Service: `app/Services/risk_scoring_service.ts`
- Intégration: `app/Controllers/Http/lookup_controller.ts`

## Liste FR_KAV_OPERATORS

- `LEGO`
- `VOXB`
- `ONOF`
- `LGC`
- `KAVE`
- `IPTB`
- `SPCV`
- `VAST`
- `UBIX`
- `COCR`
- `INOX`
- `PHGS`
- `TWIL`
- `OXIL`
- `EONE`
- `CLTE`
- `IPDI`
- `BJTP`
- `LNCT`
- `ANEL`
