# React Edit - Dev Tool

In-browser text editor for React components. Edit text directly in the browser and save changes to JSON files for manual review.

## Usage

1. Press **Ctrl+E** (or **Cmd+E** on Mac) to toggle edit mode
2. Click on any text to edit it inline
3. Press **Enter** to save or **Escape** to cancel
4. Edits are saved to `.react-edit/` folder as JSON files (per page)

## Where Edits Are Saved

Edits are saved to `.react-edit/<page-name>.json`:

```
.react-edit/
├── index.json          # Edits from /
├── dashboard.json      # Edits from /dashboard
├── settings_profile.json  # Edits from /settings/profile
└── ...
```

Each JSON file contains:

```json
{
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "edits": [
    {
      "id": "edit_1234567890_abc123",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "page": "/dashboard",
      "componentName": "DashboardHeader",
      "sourceLocation": "src/components/dashboard/header.tsx:42",
      "originalText": "Welcome back",
      "newText": "Welcome back, User!",
      "applied": false
    }
  ]
}
```

## View All Edits

GET request to see all pending edits:

```bash
curl http://localhost:3000/api/dev/react-edit
```

## How to Remove for Production

Delete these files/folders before pushing to production:

### 1. Remove the lib folder

```bash
rm -rf src/lib/react-edit
```

### 2. Remove the API route

```bash
rm -rf src/app/api/dev/react-edit
```

### 3. Remove the loader component

```bash
rm src/components/dev/react-edit-loader.tsx
```

### 4. Update layout.tsx

Remove these lines from `src/app/layout.tsx`:

```diff
- import { ReactEditLoader } from '@/components/dev/react-edit-loader';

  ...

- <ReactEditLoader />
```

### 5. Clean up edits folder (optional)

```bash
rm -rf .react-edit
```

## One-Line Removal

```bash
rm -rf src/lib/react-edit src/app/api/dev/react-edit src/components/dev/react-edit-loader.tsx .react-edit
```

Then manually remove the import and component from `src/app/layout.tsx`.

## Notes

- This tool only works in development mode (`NODE_ENV=development`)
- The API route will throw an error if loaded in production
- Edits are DOM-only until you manually apply them to source files
- The `.react-edit` folder is gitignored by default
