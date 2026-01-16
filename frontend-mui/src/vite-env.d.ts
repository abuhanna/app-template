/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_BACKEND_TYPE: 'dotnet' | 'nest' | 'spring'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
