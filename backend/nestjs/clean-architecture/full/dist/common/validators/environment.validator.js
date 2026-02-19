"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = validateEnvironment;
function validateEnvironment() {
    const errors = [];
    const required = [
        'DB_HOST',
        'DB_PORT',
        'DB_NAME',
        'DB_USERNAME',
        'DB_PASSWORD',
        'JWT_SECRET',
    ];
    for (const key of required) {
        if (!process.env[key]) {
            errors.push(`Missing required environment variable: ${key}`);
        }
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
        errors.push('JWT_SECRET must be at least 32 characters long');
    }
    const recommended = ['JWT_ISSUER', 'JWT_AUDIENCE'];
    for (const key of recommended) {
        if (!process.env[key]) {
            console.warn(`Warning: ${key} is not set. Using default value.`);
        }
    }
    if (errors.length > 0) {
        const errorMessage = errors.map((e) => `  - ${e}`).join('\n');
        throw new Error(`Environment validation failed:\n${errorMessage}\n\nPlease check your .env file or environment variables.`);
    }
}
//# sourceMappingURL=environment.validator.js.map