import type { Feature, BackendFramework, BackendArchitecture } from './types.js';

/**
 * Feature metadata for prompts
 */
export interface FeatureOption {
  value: Feature;
  label: string;
  hint: string;
}

export const FEATURE_OPTIONS: FeatureOption[] = [
  {
    value: 'auth',
    label: 'Authentication (Login, JWT, Guards)',
    hint: 'Login/logout pages, JWT middleware, auth guards, profile',
  },
  {
    value: 'userManagement',
    label: 'User Management',
    hint: 'User CRUD, roles, permissions',
  },
  {
    value: 'departments',
    label: 'Departments',
    hint: 'Department CRUD module',
  },
  {
    value: 'fileUpload',
    label: 'File Management',
    hint: 'File upload, download, preview',
  },
  {
    value: 'auditLogs',
    label: 'Audit Logging',
    hint: 'Track all data changes with audit trail',
  },
  {
    value: 'notifications',
    label: 'Notifications',
    hint: 'Real-time notification system (WebSocket)',
  },
  {
    value: 'dataExport',
    label: 'Data Export',
    hint: 'CSV, Excel, PDF export',
  },
  {
    value: 'dashboard',
    label: 'Dashboard',
    hint: 'Dashboard page with statistics (Requires Users, Depts, Notifications)',
  },
];

/**
 * Feature dependency rules:
 * - Removing `auth` also removes `userManagement` and `departments`
 * - Removing `userManagement` also removes `departments`
 */
export function applyFeatureDependencies(selected: Feature[]): Feature[] {
  let result = [...selected];

  // If auth is not selected, remove userManagement and departments
  if (!result.includes('auth')) {
    result = result.filter(f => f !== 'userManagement' && f !== 'departments');
  }

  // If userManagement is not selected, remove departments
  if (!result.includes('userManagement')) {
    result = result.filter(f => f !== 'departments');
  }

  // Dashboard depends on multiple features for its stats
  // If any of these are missing, we should probably remove the dashboard to avoid broken imports
  // Dependencies: userManagement, departments, notifications
  if (
    !result.includes('userManagement') ||
    !result.includes('departments') ||
    !result.includes('notifications')
  ) {
    result = result.filter(f => f !== 'dashboard');
  }

  return result;
}

/**
 * Map of feature to file/folder paths to REMOVE when the feature is deselected.
 * Paths are relative to the backend or frontend root directory.
 * Uses glob-like patterns (but we'll do simple startsWith/includes matching).
 */
interface FeatureFilePaths {
  backend: string[];
  frontend: string[];
}

// ============================================================
// .NET Clean Architecture (backend-dotnet)
// ============================================================
const DOTNET_CLEAN_MAP: Record<string, FeatureFilePaths> = {
  auth: {
    backend: [
      // Application layer
      'src/Core/App.Template.Application/Features/Authentication',
      'src/Core/App.Template.Application/DTOs/Auth',
      'src/Core/App.Template.Application/Interfaces/IJwtTokenService.cs',
      'src/Core/App.Template.Application/Interfaces/IPasswordHashService.cs',
      'src/Core/App.Template.Application/Interfaces/ISsoAuthService.cs',
      'src/Core/App.Template.Application/Interfaces/IEmailService.cs',
      // Infrastructure layer
      'src/Infrastructure/App.Template.Infrastructure/Services/JwtTokenService.cs',
      'src/Infrastructure/App.Template.Infrastructure/Services/PasswordHashService.cs',
      'src/Infrastructure/App.Template.Infrastructure/Services/SsoAuthService.cs',
      'src/Infrastructure/App.Template.Infrastructure/Services/SsoApiModels.cs',
      'src/Infrastructure/App.Template.Infrastructure/Services/EmailService.cs',
      // Presentation layer
      'src/Presentation/App.Template.WebAPI/Controllers/AuthController.cs',
      'src/Core/App.Template.Application/DTOs/UserDto.cs', // Required by Auth
    ],
    frontend: [], // Frontend auth files handled by pattern below
  },
  userManagement: {
    backend: [
      'src/Core/App.Template.Application/Features/UserManagement',
      // 'src/Core/App.Template.Application/DTOs/UserDto.cs', // Moved to auth
      'src/Presentation/App.Template.WebAPI/Controllers/UsersController.cs',
    ],
    frontend: [],
  },
  departments: {
    backend: [
      'src/Core/App.Template.Application/Features/DepartmentManagement',
      'src/Core/App.Template.Application/DTOs/DepartmentDto.cs',
      'src/Core/App.Template.Application/Interfaces/IOrganizationService.cs',
      'src/Infrastructure/App.Template.Infrastructure/Services/OrganizationService.cs',
      'src/Presentation/App.Template.WebAPI/Controllers/DepartmentsController.cs',
    ],
    frontend: [],
  },
  fileUpload: {
    backend: [
      'src/Core/App.Template.Application/Features/FileManagement',
      'src/Core/App.Template.Application/DTOs/UploadedFileDto.cs',
      'src/Core/App.Template.Application/Interfaces/IFileStorageService.cs',
      'src/Infrastructure/App.Template.Infrastructure/Services/FileStorageService.cs',
      'src/Presentation/App.Template.WebAPI/Controllers/FilesController.cs',
    ],
    frontend: [],
  },
  auditLogs: {
    backend: [
      'src/Core/App.Template.Application/Features/AuditLogManagement',
      'src/Core/App.Template.Application/DTOs/AuditLogDto.cs',
      'src/Infrastructure/App.Template.Infrastructure/Persistence/AuditEntry.cs',
      'src/Presentation/App.Template.WebAPI/Controllers/AuditLogsController.cs',
    ],
    frontend: [],
  },
  notifications: {
    backend: [
      'src/Core/App.Template.Application/Features/NotificationManagement',
      'src/Core/App.Template.Application/DTOs/NotificationDto.cs',
      'src/Core/App.Template.Application/Interfaces/INotificationService.cs',
      'src/Infrastructure/App.Template.Infrastructure/Services/NotificationService.cs',
      'src/Infrastructure/App.Template.Infrastructure/Hubs',
      'src/Infrastructure/App.Template.Infrastructure/SignalR',
      'src/Presentation/App.Template.WebAPI/Controllers/NotificationsController.cs',
    ],
    frontend: [],
  },
  dataExport: {
    backend: [
      'src/Core/App.Template.Application/Interfaces/IExportService.cs',
      'src/Infrastructure/App.Template.Infrastructure/Services/ExportService.cs',
      'src/Presentation/App.Template.WebAPI/Controllers/ExportController.cs',
    ],
    frontend: [],
  },
  dashboard: {
    backend: [],
    frontend: [],
  },
};

// ============================================================
// .NET N-Layer Architecture (backend-dotnet-nlayer)
// ============================================================
const DOTNET_NLAYER_MAP: Record<string, FeatureFilePaths> = {
  auth: {
    backend: [
      'src/App.Template.Api/Controllers/AuthController.cs',
      'src/App.Template.Api/Services/AuthService.cs',
      'src/App.Template.Api/Services/JwtTokenGenerator.cs',
      'src/App.Template.Api/Models/Dtos/AuthDtos.cs',
      'src/App.Template.Api/Models/Dtos/UserDtos.cs', // Required by Auth
    ],
    frontend: [],
  },
  userManagement: {
    backend: [
      'src/App.Template.Api/Controllers/UsersController.cs',
      'src/App.Template.Api/Services/UserService.cs',
      'src/App.Template.Api/Services/IUserService.cs',
      'src/App.Template.Api/Repositories/UserRepository.cs',
      'src/App.Template.Api/Repositories/IUserRepository.cs',
      // 'src/App.Template.Api/Models/Dtos/UserDtos.cs', // Moved to auth
    ],
    frontend: [],
  },
  departments: {
    backend: [
      'src/App.Template.Api/Controllers/DepartmentsController.cs',
      'src/App.Template.Api/Models/Dtos/DepartmentDtos.cs',
    ],
    frontend: [],
  },
  fileUpload: {
    backend: [
      'src/App.Template.Api/Controllers/FilesController.cs',
    ],
    frontend: [],
  },
  auditLogs: {
    backend: [],
    frontend: [],
  },
  notifications: {
    backend: [
      'src/App.Template.Api/Controllers/NotificationsController.cs',
      'src/App.Template.Api/Infrastructure/Hubs',
    ],
    frontend: [],
  },
  dataExport: {
    backend: [
      'src/App.Template.Api/Controllers/ExportController.cs',
    ],
    frontend: [],
  },
  dashboard: {
    backend: [],
    frontend: [],
  },
};

// ============================================================
// .NET Package by Feature Architecture (backend-dotnet-feature)
// ============================================================
const DOTNET_FEATURE_MAP: Record<string, FeatureFilePaths> = {
  auth: {
    backend: [
      'src/App.Template.Api/Features/Auth',
    ],
    frontend: [],
  },
  userManagement: {
    backend: [
      // 'src/App.Template.Api/Features/Users', // Don't remove whole folder, Auth needs Entity/Repo/DTOs
      'src/App.Template.Api/Features/Users/UsersController.cs',
      'src/App.Template.Api/Features/Users/UserService.cs',
      'src/App.Template.Api/Features/Users/IUserService.cs',
    ],
    frontend: [],
  },
  departments: {
    backend: [
      'src/App.Template.Api/Features/Departments',
    ],
    frontend: [],
  },
  fileUpload: {
    backend: [
      'src/App.Template.Api/Features/Files',
    ],
    frontend: [],
  },
  auditLogs: {
    backend: [],
    frontend: [],
  },
  notifications: {
    backend: [
      'src/App.Template.Api/Features/Notifications',
    ],
    frontend: [],
  },
  dataExport: {
    backend: [
      'src/App.Template.Api/Features/Export',
    ],
    frontend: [],
  },
  dashboard: {
    backend: [],
    frontend: [],
  },
};

// ============================================================
// Spring Boot Clean Architecture (backend-spring)
// ============================================================
const SPRING_CLEAN_MAP: Record<string, FeatureFilePaths> = {
  auth: {
    backend: [
      'api/src/main/java/apptemplate/api/controllers/AuthController.java',
    ],
    frontend: [],
  },
  userManagement: {
    backend: [
      'api/src/main/java/apptemplate/api/controllers/UsersController.java',
    ],
    frontend: [],
  },
  departments: {
    backend: [
      'api/src/main/java/apptemplate/api/controllers/DepartmentsController.java',
    ],
    frontend: [],
  },
  fileUpload: {
    backend: [
      'api/src/main/java/apptemplate/api/controllers/FilesController.java',
    ],
    frontend: [],
  },
  auditLogs: {
    backend: [
      'api/src/main/java/apptemplate/api/controllers/AuditLogsController.java',
    ],
    frontend: [],
  },
  notifications: {
    backend: [
      'api/src/main/java/apptemplate/api/controllers/NotificationsController.java',
    ],
    frontend: [],
  },
  dataExport: {
    backend: [
      'api/src/main/java/apptemplate/api/controllers/ExportController.java',
    ],
    frontend: [],
  },
  dashboard: {
    backend: [],
    frontend: [],
  },
};

// ============================================================
// Spring Boot N-Layer Architecture (backend-spring-nlayer)
// ============================================================
const SPRING_NLAYER_MAP: Record<string, FeatureFilePaths> = {
  auth: {
    backend: [
      'src/main/java/com/apptemplate/api/controller/AuthController.java',
    ],
    frontend: [],
  },
  userManagement: {
    backend: [
      'src/main/java/com/apptemplate/api/controller/UserController.java',
    ],
    frontend: [],
  },
  departments: {
    backend: [
      'src/main/java/com/apptemplate/api/controller/DepartmentController.java',
    ],
    frontend: [],
  },
  fileUpload: {
    backend: [
      'src/main/java/com/apptemplate/api/controller/FileController.java',
    ],
    frontend: [],
  },
  auditLogs: {
    backend: [
      'src/main/java/com/apptemplate/api/audit',
    ],
    frontend: [],
  },
  notifications: {
    backend: [
      'src/main/java/com/apptemplate/api/controller/NotificationController.java',
    ],
    frontend: [],
  },
  dataExport: {
    backend: [
      'src/main/java/com/apptemplate/api/controller/ExportController.java',
    ],
    frontend: [],
  },
  dashboard: {
    backend: [],
    frontend: [],
  },
};

// ============================================================
// Spring Boot Package by Feature Architecture (backend-spring-feature)
// ============================================================
const SPRING_FEATURE_MAP: Record<string, FeatureFilePaths> = {
  auth: {
    backend: [
      'src/main/java/com/apptemplate/api/features/auth',
    ],
    frontend: [],
  },
  userManagement: {
    backend: [
      'src/main/java/com/apptemplate/api/features/users',
    ],
    frontend: [],
  },
  departments: {
    backend: [
      'src/main/java/com/apptemplate/api/features/departments',
    ],
    frontend: [],
  },
  fileUpload: {
    backend: [
      'src/main/java/com/apptemplate/api/features/files',
    ],
    frontend: [],
  },
  auditLogs: {
    backend: [
      'src/main/java/com/apptemplate/api/common/audit',
    ],
    frontend: [],
  },
  notifications: {
    backend: [
      'src/main/java/com/apptemplate/api/features/notifications',
    ],
    frontend: [],
  },
  dataExport: {
    backend: [
      'src/main/java/com/apptemplate/api/features/export',
    ],
    frontend: [],
  },
  dashboard: {
    backend: [],
    frontend: [],
  },
};

// ============================================================
// NestJS Clean Architecture (backend-nestjs)
// ============================================================
const NESTJS_CLEAN_MAP: Record<string, FeatureFilePaths> = {
  auth: {
    backend: [
      'src/modules/auth',
    ],
    frontend: [],
  },
  userManagement: {
    backend: [
      'src/modules/user-management',
    ],
    frontend: [],
  },
  departments: {
    backend: [
      'src/modules/department-management',
    ],
    frontend: [],
  },
  fileUpload: {
    backend: [
      'src/modules/file-management',
    ],
    frontend: [],
  },
  auditLogs: {
    backend: [
      'src/modules/audit-log',
    ],
    frontend: [],
  },
  notifications: {
    backend: [
      'src/modules/notification',
    ],
    frontend: [],
  },
  dataExport: {
    backend: [
      'src/modules/export',
    ],
    frontend: [],
  },
  dashboard: {
    backend: [],
    frontend: [],
  },
};

// ============================================================
// NestJS N-Layer Architecture (backend-nestjs-nlayer)
// ============================================================
const NESTJS_NLAYER_MAP: Record<string, FeatureFilePaths> = {
  auth: {
    backend: [
      'src/auth',
    ],
    frontend: [],
  },
  userManagement: {
    backend: [],
    frontend: [],
  },
  departments: {
    backend: [
      'src/modules/departments',
    ],
    frontend: [],
  },
  fileUpload: {
    backend: [
      'src/modules/files',
    ],
    frontend: [],
  },
  auditLogs: {
    backend: [],
    frontend: [],
  },
  notifications: {
    backend: [
      'src/modules/notifications',
    ],
    frontend: [],
  },
  dataExport: {
    backend: [
      'src/modules/export',
    ],
    frontend: [],
  },
  dashboard: {
    backend: [],
    frontend: [],
  },
};

// ============================================================
// NestJS Package by Feature Architecture (backend-nestjs-feature)
// ============================================================
const NESTJS_FEATURE_MAP: Record<string, FeatureFilePaths> = {
  auth: {
    backend: [
      'src/features/auth',
    ],
    frontend: [],
  },
  userManagement: {
    backend: [
      'src/features/users',
    ],
    frontend: [],
  },
  departments: {
    backend: [
      'src/features/departments',
    ],
    frontend: [],
  },
  fileUpload: {
    backend: [
      'src/features/files',
    ],
    frontend: [],
  },
  auditLogs: {
    backend: [],
    frontend: [],
  },
  notifications: {
    backend: [
      'src/features/notifications',
    ],
    frontend: [],
  },
  dataExport: {
    backend: [
      'src/features/export',
    ],
    frontend: [],
  },
  dashboard: {
    backend: [],
    frontend: [],
  },
};

// ============================================================
// Frontend file mappings (shared across Vue and React)
// ============================================================

/**
 * Vue frontend file patterns (Vuetify / PrimeVue)
 */
const VUE_FRONTEND_MAP: Record<string, string[]> = {
  auth: [
    'src/pages/login.vue',
    'src/pages/forgot-password.vue',
    'src/pages/reset-password.vue',
    'src/pages/profile.vue',
    'src/stores/auth.js',
    'src/services/authApi.js',
  ],
  userManagement: [
    'src/pages/users',
    'src/stores/user.js',
    'src/services/userApi.js',
  ],
  departments: [
    'src/pages/departments',
    'src/stores/department.js',
    'src/services/departmentApi.js',
  ],
  fileUpload: [
    'src/pages/files',
    'src/services/fileService.js',
  ],
  auditLogs: [
    'src/pages/audit-logs',
    'src/services/auditLogService.js',
  ],
  notifications: [
    'src/pages/notifications',
    'src/stores/notification.js',
    'src/stores/persistentNotification.js',
    'src/services/notificationApi.js',
  ],
  dataExport: [
    'src/services/exportService.js',
  ],
  dashboard: [
    'src/pages/dashboard.vue',
  ],
};

/**
 * React frontend file patterns (MUI / PrimeReact)
 */
const REACT_FRONTEND_MAP: Record<string, string[]> = {
  auth: [
    'src/pages/Login.tsx',
    'src/pages/ForgotPassword.tsx',
    'src/pages/ResetPassword.tsx',
    'src/pages/Profile.tsx',
    'src/stores/authStore.ts',
    'src/services/authApi.ts',
  ],
  userManagement: [
    'src/pages/Users.tsx',
    'src/stores/userStore.ts',
    'src/services/userApi.ts',
  ],
  departments: [
    'src/pages/Departments.tsx',
    'src/stores/departmentStore.ts',
    'src/services/departmentApi.ts',
  ],
  fileUpload: [
    'src/pages/FilesPage.tsx',
    'src/services/fileService.ts',
  ],
  auditLogs: [
    'src/pages/AuditLogsPage.tsx',
    'src/pages/AuditLogs.tsx',
    'src/services/auditLogService.ts',
  ],
  notifications: [
    'src/pages/Notifications.tsx',
    'src/stores/notificationStore.ts',
    'src/stores/persistentNotificationStore.ts',
    'src/services/notificationApi.ts',
  ],
  dataExport: [
    'src/services/exportService.ts',
  ],
  dashboard: [
    'src/pages/Dashboard.tsx',
    'src/pages/Dashboard.scss',
  ],
};

/**
 * Get the backend feature file map based on framework and architecture
 */
export function getBackendFileMap(
  backend: BackendFramework,
  architecture: BackendArchitecture
): Record<string, FeatureFilePaths> {
  const key = `${backend}-${architecture}`;

  switch (key) {
    case 'dotnet-clean':
      return DOTNET_CLEAN_MAP;
    case 'dotnet-nlayer':
      return DOTNET_NLAYER_MAP;
    case 'dotnet-feature':
      return DOTNET_FEATURE_MAP;
    case 'spring-clean':
      return SPRING_CLEAN_MAP;
    case 'spring-nlayer':
      return SPRING_NLAYER_MAP;
    case 'spring-feature':
      return SPRING_FEATURE_MAP;
    case 'nestjs-clean':
      return NESTJS_CLEAN_MAP;
    case 'nestjs-nlayer':
      return NESTJS_NLAYER_MAP;
    case 'nestjs-feature':
      return NESTJS_FEATURE_MAP;
    default:
      return {};
  }
}

/**
 * Get the frontend feature file map based on framework
 */
export function getFrontendFileMap(
  frontendFramework: 'vue' | 'react'
): Record<string, string[]> {
  return frontendFramework === 'vue' ? VUE_FRONTEND_MAP : REACT_FRONTEND_MAP;
}

/**
 * Get label for features display
 */
export function getFeaturesLabel(features: Feature[], allFeatures: Feature[]): string {
  if (features.length === allFeatures.length) {
    return 'All features';
  }
  if (features.length === 0) {
    return 'None (bare template)';
  }
  return features
    .map(f => FEATURE_OPTIONS.find(o => o.value === f)?.label || f)
    .join(', ');
}
