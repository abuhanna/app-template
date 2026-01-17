module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce specific commit types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding/updating tests
        'build',    // Build system changes
        'ci',       // CI/CD changes
        'chore',    // Other changes (e.g., updating dependencies)
        'revert',   // Reverting previous commits
      ],
    ],
    // Optional: suggest specific scopes
    'scope-enum': [
      1, // Warning level (not enforced)
      'always',
      [
        'backend-dotnet',
        'backend-spring',
        'backend-nestjs',
        'frontend-vuetify',
        'frontend-primevue',
        'frontend-mui',
        'frontend-primereact',
        'cli',
        'deps',
        'config',
        'docker',
        'ci',
      ],
    ],
    // Subject should not be empty
    'subject-empty': [2, 'never'],
    // Subject should not end with period
    'subject-full-stop': [2, 'never', '.'],
    // Subject case should be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // Type should not be empty
    'type-empty': [2, 'never'],
    // Type should be lowercase
    'type-case': [2, 'always', 'lower-case'],
  },
};
