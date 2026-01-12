export type ProjectType = 'fullstack' | 'backend' | 'frontend';
export type BackendFramework = 'dotnet' | 'spring' | 'nestjs';
export type UILibrary = 'vuetify' | 'primevue';

export interface ProjectConfig {
  projectPath: string;
  projectType: ProjectType;
  backend: BackendFramework;
  ui: UILibrary;
  projectName: string;
  installDeps: boolean;
}

export interface CLIArgs {
  projectPath?: string;
  type?: ProjectType;
  backend?: BackendFramework;
  ui?: UILibrary;
  projectName?: string;
  install?: boolean;
  help?: boolean;
  version?: boolean;
}
