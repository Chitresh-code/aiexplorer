# API Dropdown Endpoints Documentation

## Overview
These endpoints provide data from lookup tables formatted specifically for dropdown components in the frontend.

## Endpoints

### AI Themes
**GET** `/api/dropdowns/ai-themes`

Returns all AI themes from the `AIThemeMapping` table.

**Response:**
```json
[
  {"value": "Conversational AI", "label": "Conversational AI"},
  {"value": "Audio Generation", "label": "Audio Generation"}
]
```

---

### Target Personas
**GET** `/api/dropdowns/personas`

Returns all personas from the `PersonaMapping` table.

**Response:**
```json
[
  {"value": "Business Analyst", "label": "Business Analyst"},
  {"value": "Developer", "label": "Developer"}
]
```

---

### Vendors
**GET** `/api/dropdowns/vendors`

Returns unique vendor names from the `VendorModelMapping` table.

**Response:**
```json
[
  {"value": "OpenAI", "label": "OpenAI"},
  {"value": "Google", "label": "Google"}
]
```

---

### Models
**GET** `/api/dropdowns/models?vendor={vendorName}`

Returns models, optionally filtered by vendor.

**Query Parameters:**
- `vendor` (optional): Filter models by vendor name

**Response:**
```json
[
  {"value": "GPT-4", "label": "GPT-4", "vendor": "OpenAI"},
  {"value": "Custom AI API", "label": "Custom AI API", "vendor": "Google"}
]
```

**Example Usage:**
- All models: `/api/dropdowns/models`
- OpenAI models only: `/api/dropdowns/models?vendor=OpenAI`

---

### Business Units
**GET** `/api/dropdowns/business-units`

Returns unique business unit names from the `BusinessUnitMapping` table.

**Response:**
```json
[
  {"value": "Engineering", "label": "Engineering"},
  {"value": "Legal", "label": "Legal"}
]
```

---

### Teams
**GET** `/api/dropdowns/teams?business_unit={businessUnitName}`

Returns team names, optionally filtered by business unit.

**Query Parameters:**
- `business_unit` (optional): Filter teams by business unit

**Response:**
```json
[
  {"value": "Cloud", "label": "Cloud"},
  {"value": "Legal", "label": "Legal"}
]
```

**Example Usage:**
- All teams: `/api/dropdowns/teams`
- Engineering teams only: `/api/dropdowns/teams?business_unit=Engineering`

---

### Sub-Teams
**GET** `/api/dropdowns/sub-teams?team={teamName}`

Returns sub-team names, optionally filtered by team.

**Query Parameters:**
- `team` (optional): Filter sub-teams by team name

**Response:**
```json
[
  {"value": "GTM", "label": "GTM"},
  {"value": "Backend", "label": "Backend"}
]
```

**Example Usage:**
- All sub-teams: `/api/dropdowns/sub-teams`
- Cloud sub-teams only: `/api/dropdowns/sub-teams?team=Cloud`

---

## Frontend Integration Example

### React Hook for Fetching Dropdown Data

```javascript
import { useState, useEffect } from 'react';

export const useDropdownData = (endpoint) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8001/api/dropdowns/${endpoint}`);
        const data = await response.json();
        setOptions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { options, loading, error };
};
```

### Usage in Component

```javascript
const SubmitUseCase = () => {
  const { options: aiThemes } = useDropdownData('ai-themes');
  const { options: personas } = useDropdownData('personas');
  const { options: vendors } = useDropdownData('vendors');
  const { options: businessUnits } = useDropdownData('business-units');

  return (
    <select>
      {aiThemes.map(theme => (
        <option key={theme.value} value={theme.value}>
          {theme.label}
        </option>
      ))}
    </select>
  );
};
```

### Cascading Dropdowns Example

```javascript
const [selectedVendor, setSelectedVendor] = useState('');
const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('');
const [selectedTeam, setSelectedTeam] = useState('');

const { options: vendors } = useDropdownData('vendors');
const { options: models } = useDropdownData(`models?vendor=${selectedVendor}`);
const { options: businessUnits } = useDropdownData('business-units');
const { options: teams } = useDropdownData(`teams?business_unit=${selectedBusinessUnit}`);
const { options: subTeams } = useDropdownData(`sub-teams?team=${selectedTeam}`);
```

---

## Data Mappings

### UseCases Table → Lookup Tables

| UseCases Column | Lookup Table | Endpoint |
|----------------|--------------|----------|
| `AITheme` | `AIThemeMapping.ThemeName` | `/api/dropdowns/ai-themes` |
| `TargetPersonas` | `PersonaMapping.PersonaName` | `/api/dropdowns/personas` |
| `VendorName` | `VendorModelMapping.VendorName` | `/api/dropdowns/vendors` |
| `ModelName` | `VendorModelMapping.ProductName` | `/api/dropdowns/models` |
| `BusinessUnit` | `BusinessUnitMapping.BusinessUnitName` | `/api/dropdowns/business-units` |
| `TeamName` | `BusinessUnitMapping.TeamName` | `/api/dropdowns/teams` |
| `SubTeamName` | `BusinessUnitMapping.SubTeamName` | `/api/dropdowns/sub-teams` |

---

## Testing

You can test these endpoints using:

### cURL
```bash
curl http://localhost:8001/api/dropdowns/ai-themes
curl http://localhost:8001/api/dropdowns/models?vendor=OpenAI
```

### Browser
Navigate to:
- http://localhost:8001/api/dropdowns/ai-themes
- http://localhost:8001/api/dropdowns/personas
- http://localhost:8001/api/dropdowns/vendors

### Swagger UI
Navigate to http://localhost:8001/docs to see interactive API documentation.
