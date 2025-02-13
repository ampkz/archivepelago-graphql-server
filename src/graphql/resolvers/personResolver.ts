import { Person } from "../../archive/person";
import { Auth, isPermitted } from "../../auth/authorization";
import { createPerson, deletePerson, getPerson, updatePerson } from "../../db/archive/crud-person"
import { mutationFailed, serverFailed, unauthorizedError } from "../errors/errors";

export default {
    Query: {
        person: async(_root: any, { id }: any, { authorizedUser }: any) => {
            let person: Person | undefined = undefined;

            try {
                person = await getPerson(id);
            }catch ( error: any ){
                throw serverFailed(error.message);
           }
            
            return person;
        }
    },

    Mutation: {
        createPerson: async (_root: any, { input: { firstName, lastName, secondName, birthDate, deathDate } }: any, { authorizedUser }: any) => {
            if(!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)){
                throw unauthorizedError(`You are not authorized to make this mutation.`);
            }

            let person: Person;

            try {
                person = await createPerson( { firstName, lastName, secondName, birthDate, deathDate } as Person );
            }catch ( error: any ){
                throw mutationFailed(error.message);
            }

            return person;
        },

        deletePerson: async (_root: any, { id }: any, { authorizedUser }: any) => {
            if(!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)){
                throw unauthorizedError(`You are not authorized to make this mutation`);
            }

            let person: Person | undefined = undefined;

            try {
                person = await deletePerson(id);
            }catch ( error: any ) {
                throw mutationFailed(error.message);
            }

            return person;
        },

        updatePerson: async (_root: any, { input: { id, updatedFirstName, updatedLastName, updatedSecondName, updatedBirthDate, updatedDeathDate}}: any, { authorizedUser }: any) => {
            if(!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)){
                throw unauthorizedError(`You are not authorized to make this mutation`);
            }

            let person: Person | undefined = undefined;
            
            try {
                person = await updatePerson({ id, updatedFirstName, updatedLastName, updatedSecondName, updatedBirthDate, updatedDeathDate });
            }catch ( error: any ) {
                throw mutationFailed(error.message);
            }

            return person;
        },
    }
}