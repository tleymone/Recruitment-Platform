// Import the necessary dependencies
const supertest = require("supertest");
const app = require("../app");


// Example test for the '/' route
describe('GET /', () => {
    it('should redirect to /login', async () => {
        jest.setTimeout(10000);
        const response = await supertest(app).get('/');
        expect(response.status).toBe(302);
        expect(response.header['location']).toBe('/login');
    });
});

// Example test for the '/login' route
describe('GET /login', () => {
    it('should render the login page', async () => {
        jest.setTimeout(10000);
        const response = await supertest(app).get('/login');
        expect(response.status).toBe(200);

        // Extract the title from the response HTML
        const titleRegex = /<title>(.*?)<\/title>/;
        const titleMatch = response.text.match(titleRegex);
        const pageTitle = titleMatch ? titleMatch[1] : null;

        // Expect the title to be equal to the expected title
        expect(pageTitle).toEqual('Connexion');
    });
});

// Example test for the '/signin' route
describe('GET /signin', () => {
    it('should render the signin page', async () => {
        jest.setTimeout(10000);
        const response = await supertest(app).get('/signin');
        expect(response.status).toBe(200);
        // Add your assertions for the signin page here
    });
});

// Example test for the POST /login route
describe('POST /login', () => {
    it('should redirect to /candidate with valid credentials', async () => {
        jest.setTimeout(10000);
        const response = await supertest(app)
            .post('/login')
            .send({ email: 'test@example.com', pwd: 'Azertyuio123*' });
        expect(response.status).toBe(302);
        expect(response.header['location']).toBe('/candidate');
    });

    it('should display an error message with invalid credentials', async () => {
        jest.setTimeout(10000);
        const response = await supertest(app)
            .post('/login')
            .send({ email: 'invalid@example.com', pwd: 'wrongpassword' });
        expect(response.status).toBe(200);
        expect(response.text).toContain('Incorrect Username and/or Password!');
    });
});

// Example test for the '/logout' route
describe('GET /logout', () => {
    it('should clear the rememberToken cookie and redirect to /', async () => {
        jest.setTimeout(10000);
        const response = await supertest(app).get('/logout');
        expect(response.status).toBe(302);
        expect(response.header['location']).toBe('/');
        expect(response.header['set-cookie']).toContain('rememberToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    });
});