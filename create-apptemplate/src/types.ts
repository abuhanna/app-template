export type ProjectType = 'fullstack' | 'backend' | 'frontend';
export type BackendFramework = 'dotnet' | 'spring' | 'nestjs';
export type BackendArchitecture = 'clean' | 'nlayer' | 'feature';
export type FrontendFramework = 'vue' | 'react';
export type UILibrary = 'vuetify' | 'primevue' | 'primereact' | 'mui';

export interface ProjectConfig {
  projectPath: string;
  projectType: ProjectType;
  backend: BackendFramework;
  architecture: BackendArchitecture;
  frontendFramework: FrontendFramework;
  ui: UILibrary;
  projectName?: string; // Only required for dotnet/spring (namespace)
  installDeps: boolean;
  placeInRoot: boolean; // For backend-only/frontend-only: place files in root instead of subfolder
}

export interface CLIArgs {
  projectPath?: string;
  type?: ProjectType;
  backend?: BackendFramework;
  architecture?: BackendArchitecture;
  framework?: FrontendFramework;
  ui?: UILibrary;
  projectName?: string;
  install?: boolean;
  root?: boolean; // Place files in root (for backend-only/frontend-only)
  help?: boolean;
  version?: boolean;
}
