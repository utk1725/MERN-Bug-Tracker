const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const Bug = require('../models/Bug');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Bug.deleteMany({});
    await User.deleteMany({});
});

describe('Bug Controller Tests', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
        // Create a test user
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        // Generate auth token
        authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'your-secret-key');
    });

    describe('POST /api/bugs', () => {
        it('should create a new bug', async () => {
            const bugData = {
                title: 'Test Bug',
                description: 'Test Description',
                priority: 'high',
                status: 'open'
            };

            const response = await request(app)
                .post('/api/bugs')
                .set('Authorization', `Bearer ${authToken}`)
                .send(bugData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.title).toBe(bugData.title);
            expect(response.body.createdBy).toBe(testUser._id.toString());
        });

        it('should not create a bug without required fields', async () => {
            const response = await request(app)
                .post('/api/bugs')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/bugs', () => {
        beforeEach(async () => {
            // Create some test bugs
            await Bug.create([
                {
                    title: 'Bug 1',
                    description: 'Description 1',
                    priority: 'high',
                    status: 'open',
                    createdBy: testUser._id
                },
                {
                    title: 'Bug 2',
                    description: 'Description 2',
                    priority: 'medium',
                    status: 'in-progress',
                    createdBy: testUser._id
                }
            ]);
        });

        it('should get all bugs', async () => {
            const response = await request(app)
                .get('/api/bugs')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        it('should filter bugs by status', async () => {
            const response = await request(app)
                .get('/api/bugs?status=open')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].status).toBe('open');
        });
    });

    describe('PUT /api/bugs/:id', () => {
        let testBug;

        beforeEach(async () => {
            testBug = await Bug.create({
                title: 'Test Bug',
                description: 'Test Description',
                priority: 'high',
                status: 'open',
                createdBy: testUser._id
            });
        });

        it('should update a bug', async () => {
            const updateData = {
                status: 'in-progress',
                priority: 'medium'
            };

            const response = await request(app)
                .put(`/api/bugs/${testBug._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe(updateData.status);
            expect(response.body.priority).toBe(updateData.priority);
        });

        it('should not update a bug created by another user', async () => {
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: 'password123'
            });

            const otherBug = await Bug.create({
                title: 'Other Bug',
                description: 'Other Description',
                priority: 'high',
                status: 'open',
                createdBy: otherUser._id
            });

            const response = await request(app)
                .put(`/api/bugs/${otherBug._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'resolved' });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /api/bugs/:id', () => {
        let testBug;

        beforeEach(async () => {
            testBug = await Bug.create({
                title: 'Test Bug',
                description: 'Test Description',
                priority: 'high',
                status: 'open',
                createdBy: testUser._id
            });
        });

        it('should delete a bug', async () => {
            const response = await request(app)
                .delete(`/api/bugs/${testBug._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            
            // Verify bug is deleted
            const deletedBug = await Bug.findById(testBug._id);
            expect(deletedBug).toBeNull();
        });

        it('should not delete a bug created by another user', async () => {
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: 'password123'
            });

            const otherBug = await Bug.create({
                title: 'Other Bug',
                description: 'Other Description',
                priority: 'high',
                status: 'open',
                createdBy: otherUser._id
            });

            const response = await request(app)
                .delete(`/api/bugs/${otherBug._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(403);
            
            // Verify bug is not deleted
            const bug = await Bug.findById(otherBug._id);
            expect(bug).toBeTruthy();
        });
    });
}); 