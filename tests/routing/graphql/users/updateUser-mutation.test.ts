import { faker } from "@faker-js/faker";
import startServer from "../../../../src/server/server";
import { Auth } from "../../../../src/auth/authorization";
import request from 'supertest';
import { Errors as GraphQLErrors } from '../../../../src/graphql/errors/errors';
import dotenv from 'dotenv';
import { signToken } from "../../../../src/_helpers/auth-helpers";
import * as crudUser from '../../../../src/db/users/crud-user';
import { User } from "../../../../src/users/users";
import { InternalError, ResourceExistsError } from "../../../../src/_helpers/errors-helper";

dotenv.config();

describe(`updateUser Mutation Tests`, () => {
    let app: any;
  
      beforeAll(async() => {
          app = await startServer();
      });
  
      it(`should throw an unauthorized error with no authorized user`, async() => {
        const query = `
          mutation UpdateUser($input: UpdateUserInput!){
            updateUser(input: $input) {
              firstName
              lastName
              email
              auth
            }
          }
        `;
  
        const variables = {
          input: {
            existingEmail: faker.internet.email(),
            auth: Auth.CONTRIBUTOR,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            password: faker.internet.password(),
            secondName: faker.person.middleName()
          }
        }
  
        const { body } = await request(app)
          .post('/graphql')
          .send({ query, variables })
          .set('Accept', 'application/json')
       
        expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
      });

      it(`should throw an unauthorized error with a contributor`, async() => {
        const query = `
          mutation UpdateUser($input: UpdateUserInput!){
            updateUser(input: $input) {
              firstName
              lastName
              email
              auth
            }
          }
        `;
  
        const variables = {
          input: {
            existingEmail: faker.internet.email(),
            auth: Auth.CONTRIBUTOR,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            password: faker.internet.password(),
            secondName: faker.person.middleName()
          }
        }

        const jwtToken = signToken(faker.internet.email(), Auth.CONTRIBUTOR, '1d');
  
        const { body } = await request(app)
          .post('/graphql')
          .send({ query, variables })
          .set('Accept', 'application/json')
          .set('Cookie', [`jwt=${jwtToken}`])
        
          expect(body.errors[0].extensions.code).toEqual(GraphQLErrors.UNAUTHORIZED);
      });

      it(`should throw an error if there was an issue with the server`, async() => {
        const email = faker.internet.email(),
            auth = Auth.CONTRIBUTOR,
            firstName = faker.person.firstName(),
            lastName = faker.person.lastName(),
            password = faker.internet.password(),
            secondName = faker.person.middleName();
        
        const user: User = new User(email, auth, firstName, lastName, secondName);

        const updateUserSpy = jest.spyOn(crudUser, "updateUser");
        updateUserSpy.mockResolvedValueOnce(user);

        const query = `
          mutation UpdateUser($input: UpdateUserInput!){
            updateUser(input: $input) {
              firstName
              lastName
              secondName
              email
              auth
            }
          }
        `;
  
        const variables = {
          input: {
            existingEmail: email,
            auth,
            firstName,
            lastName,
            password,
            secondName
          }
        }

        const jwtToken = signToken(faker.internet.email(), Auth.ADMIN, '1d');
  
        const { body } = await request(app)
          .post('/graphql')
          .send({ query, variables })
          .set('Accept', 'application/json')
          .set('Cookie', [`jwt=${jwtToken}`])
          expect(body.data.updateUser).toEqual(user);
        });

        it(`should update a user as admin`, async() => {
          const email = faker.internet.email(),
              auth = Auth.CONTRIBUTOR,
              firstName = faker.person.firstName(),
              lastName = faker.person.lastName(),
              password = faker.internet.password(),
              secondName = faker.person.middleName();
          
          const user: User = new User(email, auth, firstName, lastName, secondName);
  
          const updateUserSpy = jest.spyOn(crudUser, "updateUser");
          updateUserSpy.mockRejectedValue(new InternalError(crudUser.Errors.CANNOT_UPDATE_USER));
  
          const query = `
            mutation UpdateUser($input: UpdateUserInput!){
              updateUser(input: $input) {
                firstName
                lastName
                secondName
                email
                auth
              }
            }
          `;
    
          const variables = {
            input: {
              existingEmail: email,
              auth,
              firstName,
              lastName,
              password,
              secondName
            }
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