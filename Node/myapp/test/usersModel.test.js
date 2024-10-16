const DB = require("../model/db.js");
const model = require("../model/users.js");

describe("Model Tests", () => {
  const user = {
    email: "test@test.com",
    lname: "Test",
    fname: "User",
    password: "Azertyuio123*",
    telephone: "1234567890",
    status: 1,
    role: 1,
    organisation: null,
    orgAccepted: 0,
  };
  var userId = 0;
  afterAll((done) => {
    function callback (err){
    if (err) done (err);
    else done();
    }
    DB.end(callback);
    });
  
  // --- User Tests ---
  test("insert user", async () => {
    const insertId = await Promise.all([model.create(user.email, user.lname, user.fname, user.password, user.telephone)]);
    expect(insertId).toBeTruthy();
    // Verify the inserted user data
    const [data] = await Promise.all([model.read(user.email, user.password)]);
    // Assert that the inserted user has the correct first name
    expect(data[0].fname).toBe(user.fname);
    userId = data[0].id;
});
  test("are valid credentials", async () => {
    const [isValid] = await Promise.all([model.areValid(user.email, user.password)]);
    expect(isValid).toBe(true);
  });
  test("check invalid credentials", async () => {
    const email = "test@example.com";
    const password = "wrongpassword";
    
    const [isValid] = await Promise.all([model.areValid(email, password)]);
    // Assert that isValid is false
    expect(isValid).toBe(false);
  });
  test("update user", async () => {
    const fname = "Updated fname";
    const lname = "Updated lname";
    const [updateResult] = await Promise.all([model.update(user.email, lname, fname, user.password, user.telephone, user.status, user.role, user.organisation, user.orgAccepted)]);

    expect(updateResult).toBeTruthy();
    // Verify the updated user data
    const [data] = await Promise.all([model.read(user.email, user.password)]);
    // Assert that the updated user has the correct first name and last name
    const lastUser = data[data.length - 1];
    expect(lastUser.email).toBe(user.email);
    expect(lastUser.fname).toBe(fname);
    expect(lastUser.lname).toBe(lname);
    expect(lastUser.telephone).toBe(user.telephone);
    expect(lastUser.status).toBe(user.status);
    expect(lastUser.role).toBe(user.role);
    expect(lastUser.organisation).toBe(user.organisation);
    expect(lastUser.orgAccepted).toBe(user.orgAccepted);
  });
  test("read user", async () => {
    const [data] = await Promise.all([model.read(user.email, user.password)]);
    // Assert that the data returned is not empty
    expect(data.length).toBeGreaterThan(0);

    // Assert that the returned user has the correct email and password
    const returnedUser = data[data.length - 1];
    expect(returnedUser.email).toBe(user.email);

  });
  test("read by id", async () => {
    const user = await model.readById(userId);
    expect(user).toBeTruthy();
    // Add additional assertions as needed
  });
  test("read all users", async () => {
    const [data] = await Promise.all([model.readall()]);
    // Assert that the data returned is not empty
    expect(data.length).toBeGreaterThan(0);

    // Add additional assertions as needed to validate the returned data
    expect(data[data.length - 1].id).toBeTruthy();
  });
  test("assign organization", async () => {
    const organizationId = 123456789; // Replace with the actual organization ID

    const affectedRows = await model.assignOrg(userId, organizationId);
    expect(affectedRows).toBeGreaterThan(0);
  });
  test("get organization", async () => {
    const organizationId = await model.getOrganisation(userId);
    expect(organizationId).toBe(123456789); // Replace with the expected organization ID
  });
  test("get join requests for organisation", async () => {
    const organisation = 123456789;
    
    const [data] = await Promise.all([model.getJoinRequests(organisation)]);
    // Assert that the data returned is not empty
    expect(data.length).toBeGreaterThan(0);

    // Add additional assertions as needed to validate the returned data
    expect(data[data.length - 1].id).toBeTruthy();

  });
  test("accept join request", async () => {
    const [data] = await Promise.all([model.read(user.email, user.password)]);
    // Assert that the data returned is not empty
    expect(data.length).toBeGreaterThan(0);

    // Get the userId of the user
    const userId = data[data.length - 1].id;

    model.acceptJoinRequest(userId, (affectedRows) => {
      // Assert that the affectedRows count is greater than 0, indicating a successful update
      expect(affectedRows).toBeGreaterThan(0);

      // Call done to indicate the test has finished
    });
  });
  test("deny join request", async () => {
    const [data] = await Promise.all([model.read(user.email, user.password)]);
    // Assert that the data returned is not empty
    expect(data.length).toBeGreaterThan(0);

    // Get the userId of the user
    const userId = data[data.length - 1].id;

    model.denyJoinRequest(userId, (affectedRows) => {
      // Assert that the affectedRows count is greater than 0, indicating a successful update
      expect(affectedRows).toBeGreaterThan(0);
      });
  });
  test("delete user", async () => {
    const [affectedRows] = await Promise.all([model.delete(user.email)]);
    // Assert that the affectedRows count is greater than 0, indicating a successful delete
    expect(affectedRows).toBeGreaterThan(0);
    // Call done to indicate the test has finished
  });
});

