/**
 * E2E/Integration Test Setup
 */

// Increase timeout for e2e tests
jest.setTimeout(30000);

// Mock environment variables
process.env.JWT_SECRET = 'test_jwt_secret_for_testing';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_for_testing';
process.env.BCRYPT_ROUNDS = '4'; // Lower rounds for faster tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/beautyscore_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.YANDEX_GPT_API_KEY = 'test_key';
process.env.YANDEX_GPT_FOLDER_ID = 'test_folder';
