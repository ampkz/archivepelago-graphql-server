import { faker } from "@faker-js/faker";
import startServer from "../../../../../src/server/server";
import request from 'supertest';
import dotenv from 'dotenv';
import { signToken } from "../../../../../src/_helpers/auth-helpers";
import * as personLabelRelationship from '../../../../../src/db/archive/relationship/person-label-relationship';
import { InternalError, ResourceExistsError } from "../../../../../src/_helpers/errors-helper";
import { Person } from "../../../../../src/archive/person";
import { Errors as GraphQLErrors } from "../../../../../src/graphql/errors/errors";
import { Auth } from "../../../../../src/auth/authorization";

dotenv.config();

describe(`createLabelRelationship Mutation Tests`, () => {
    let app: any;
  
      beforeAll(async() => {
          app = await startServer();
      });
  
      it(`should throw an unauthorized error with no authorized user`, async() => {
        const query = `
          mutation CreateLabelRelationship($personID: ID!, $labelName: ID!){
            createLabelRelationship(personID: $personID, labelName: $labelName) {
              firstName
            }
          }
        `;
  
        const variables = {
          personID: faker.database.mongodbObjectId(),
          labelName: faker.word.adjective(),
        }
  
        const { body } = await request(app)
          .post('/graphql')
          .send({ query, variables })
          .set('Accept', 'application/json')
       
        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
      });

      it(`should create a label relationship with admin`, async() => {
        const personID = faker.database.mongodbObjectId(),
            labelName = faker.word.adjective();
        
        const person: Person = new Person({ id: personID, firstName: faker.person.firstName() });

        const createPersonRelationshipSpy = jest.spyOn(personLabelRelationship, "createPersonLabel");
        createPersonRelationshipSpy.mockResolvedValueOnce(person);

        const query = `
          mutation CreateLabelRelationship($personID: ID!, $labelName: ID!){
            createLabelRelationship(personID: $personID, labelName: $labelName) {
                id
                firstName
            }
          }
        `;

        const variables = {
          personID,
          labelName,
        }

        const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');
  
        const { body } = await request(app)
          .post('/graphql')
          .send({ query, variables })
          .set('Accept', 'application/json')
          .set('Cookie', [`jwt=${jwtToken}`])

          expect(body.data.createLabelRelationship).toEqual(person);
        });


    it(`should create a label relationship with contributor`, async() => {
        const personID = faker.database.mongodbObjectId(),
            labelName = faker.word.adjective();
        
        const person: Person = new Person({ id: personID, firstName: faker.person.firstName() });

        const createPersonRelationshipSpy = jest.spyOn(personLabelRelationship, "createPersonLabel");
        createPersonRelationshipSpy.mockResolvedValueOnce(person);

        const query = `
          mutation CreateLabelRelationship($personID: ID!, $labelName: ID!){
            createLabelRelationship(personID: $personID, labelName: $labelName) {
                id
                firstName
            }
          }
        `;

        const variables = {
          personID,
          labelName,
        }

        const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');
  
        const { body } = await request(app)
          .post('/graphql')
          .send({ query, variables })
          .set('Accept', 'application/json')
          .set('Cookie', [`jwt=${jwtToken}`])

          expect(body.data.createLabelRelationship).toEqual(person);
        });
      
      it(`should throw an error if there was an issue with the server`, async() => {
        const personID = faker.database.mongodbObjectId(),
            labelName = faker.word.adjective();
        
        const createPersonRelationshipSpy = jest.spyOn(personLabelRelationship, "createPersonLabel");
        createPersonRelationshipSpy.mockRejectedValue(new InternalError(''));

        const query = `
          mutation CreateLabelRelationship($personID: ID!, $labelName: ID!){
            createLabelRelationship(personID: $personID, labelName: $labelName) {
              firstName
            }
          }
        `;
  
        const variables = {
          personID,
          labelName,
        }

        const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');
  
        const { body } = await request(app)
          .post('/graphql')
          .send({ query, variables })
          .set('Accept', 'application/json')
          .set('Cookie', [`jwt=${jwtToken}`])

          expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.MUTATION_FAILED);
      });
  });