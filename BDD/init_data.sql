INSERT INTO TypeOrg (type) VALUES ('Non-profit');

INSERT INTO Role (role) VALUES ('Manager');

INSERT INTO Organisation (siren, name, typeOrg, address) 
VALUES (123456789, 'MaOrganisation', 1, '1 Rue des Fleurs');

INSERT INTO Users (email, lname, fname, password, telephone, creationDate, status, role, organisation) 
VALUES ('test@example.com', 'Doe', 'John', 'motdepasse', '0102030405', '2023-05-03', 1, 1, 123456789);

INSERT INTO Status (status) VALUES ('Pending');

INSERT INTO JobType (jobType) VALUES ('Full-time');

INSERT INTO JobSheet (organisation, title, status, manager, jobType, location, rythme, salary, description)
VALUES (123456789, 'Job Title', 1, 'John Doe', 1, 'Paris', 1, 50000, 'Job description.');

INSERT INTO JobOffer (jobSheet, state, endDate, requestedDocuments) VALUES (1, 'Open', '2023-06-30', 'Resume, cover letter');

INSERT INTO Application (user, jobOffer, date) VALUES (1, 1, '2023-05-03');