import { faker } from "@faker-js/faker"
import { Auth, AuthorizedUser } from "../../src/auth/authorization"

describe(`Authorization Tests`, () => {
    it('should create and Authorized User', () => {
        const email: string = faker.internet.email(),
            auth: Auth = Auth.ADMIN;
        
        const authUser: AuthorizedUser = new AuthorizedUser(email, auth);

        expect(authUser.auth).toEqual(auth);
        expect(authUser.email).toEqual(email);
    })
})