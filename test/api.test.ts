import { app } from '../src/app';
import { describe, it, expect, beforeEach } from 'bun:test';
import { clearDB } from './setup';

describe('API Integration Tests', () => {
    beforeEach(async () => {
        await clearDB();
    });

    describe('Register User (POST /api/v1/user)', () => {
        it('should register a new user successfully', async () => {
            const res = await app.handle(new Request('http://localhost/api/v1/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                })
            }));

            const data = await res.json();
            expect(res.status).toBe(200);
            expect(data.message).toBe('User created successfully');
            expect(data.data.username).toBe('testuser');
        });

        it('should fail if email already exists', async () => {
            // First registration
            await app.handle(new Request('http://localhost/api/v1/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                })
            }));

            // Second registration with same email
            const res = await app.handle(new Request('http://localhost/api/v1/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'otheruser',
                    email: 'test@example.com',
                    password: 'password123'
                })
            }));

            const data = await res.json();
            expect(res.status).toBe(400);
            expect(data.message).toBe('User already exists');
        });

        it('should fail if email format is invalid', async () => {
            const res = await app.handle(new Request('http://localhost/api/v1/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser',
                    email: 'invalid-email',
                    password: 'password123'
                })
            }));

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toBe('Validation failed');
        });

        it('should fail if password is too short', async () => {
             const res = await app.handle(new Request('http://localhost/api/v1/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'short'
                })
            }));

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toBe('Validation failed');
        });

        it('should fail if username is too short', async () => {
             const res = await app.handle(new Request('http://localhost/api/v1/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'te',
                    email: 'test@example.com',
                    password: 'password123'
                })
            }));

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toBe('Validation failed');
        });

        it('should fail if mandatory fields are missing', async () => {
             const res = await app.handle(new Request('http://localhost/api/v1/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser'
                })
            }));

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toBe('Validation failed');
        });
    });

    describe('Login User (POST /api/users/login)', () => {
         beforeEach(async () => {
            await app.handle(new Request('http://localhost/api/v1/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                })
            }));
        });

        it('should login successfully with correct credentials', async () => {
            const res = await app.handle(new Request('http://localhost/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            }));

            const data = await res.json();
            expect(res.status).toBe(200);
            expect(data.message).toBe('Token has been generated');
            expect(data.data.token).toBeDefined();
        });

        it('should fail if email not found', async () => {
            const res = await app.handle(new Request('http://localhost/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'notfound@example.com',
                    password: 'password123'
                })
            }));

            const data = await res.json();
            expect(res.status).toBe(400);
            expect(data.message).toBe('email or password is wrong');
        });

        it('should fail if password is wrong', async () => {
            const res = await app.handle(new Request('http://localhost/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
            }));

            const data = await res.json();
            expect(res.status).toBe(400);
            expect(data.message).toBe('email or password is wrong');
        });

        it('should fail if email format is invalid', async () => {
            const res = await app.handle(new Request('http://localhost/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'invalid-email',
                    password: 'password123'
                })
            }));

            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toBe('Validation failed');
        });
    });

    describe('Get Current User (GET /api/users/current-user)', () => {
        let token: string;

        beforeEach(async () => {
            await app.handle(new Request('http://localhost/api/v1/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                })
            }));

            const loginRes = await app.handle(new Request('http://localhost/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            }));
            const loginData = await loginRes.json();
            token = loginData.data.token;
        });

        it('should get current user with valid token', async () => {
            const res = await app.handle(new Request('http://localhost/api/users/current-user', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }));

            const data = await res.json();
            expect(res.status).toBe(200);
            expect(data.data.email).toBe('test@example.com');
            expect(data.data.name).toBe('testuser');
        });

        it('should fail if no token provided', async () => {
            const res = await app.handle(new Request('http://localhost/api/users/current-user', {
                method: 'GET'
            }));

            const data = await res.json();
            expect(res.status).toBe(401);
            expect(data.message).toBe('Token is not valid');
        });

        it('should fail if invalid token provided', async () => {
            const res = await app.handle(new Request('http://localhost/api/users/current-user', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer invalid-token' }
            }));

            const data = await res.json();
            expect(res.status).toBe(401);
            expect(data.message).toBe('Token is not valid');
        });
    });

    describe('Logout User (DELETE /api/users/logout)', () => {
        let token: string;

        beforeEach(async () => {
            await app.handle(new Request('http://localhost/api/v1/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                })
            }));

            const loginRes = await app.handle(new Request('http://localhost/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            }));
            const loginData = await loginRes.json();
            token = loginData.data.token;
        });

        it('should logout successfully with valid token', async () => {
            const res = await app.handle(new Request('http://localhost/api/users/logout', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }));

            const data = await res.json();
            expect(res.status).toBe(200);
            expect(data.data).toBe('OK');

            // Verify token is no longer valid
            const verifyRes = await app.handle(new Request('http://localhost/api/users/current-user', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }));
            expect(verifyRes.status).toBe(401);
        });

        it('should fail if no token provided', async () => {
            const res = await app.handle(new Request('http://localhost/api/users/logout', {
                method: 'DELETE'
            }));

            const data = await res.json();
            expect(res.status).toBe(401);
            expect(data.message).toBe('Token is not valid');
        });

        it('should fail if invalid token provided', async () => {
            const res = await app.handle(new Request('http://localhost/api/users/logout', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer invalid-token' }
            }));

            const data = await res.json();
            expect(res.status).toBe(401);
            expect(data.message).toBe('Token is not valid');
        });
    });
});
