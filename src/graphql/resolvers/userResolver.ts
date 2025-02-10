import { Auth, isPermitted, permitSelf } from "../../auth/authorization";
import { getUserByEmail } from "../../db/users/crud-user";
import { User } from "../../users/users";
import { notFoundError, unauthorizedError } from "../errors/errors";

export default {
    Query: {
        user: async(_root: any, { email }: any, { authorizedUser }: any) =>{

            if(!isPermitted(authorizedUser, Auth.ADMIN) && !permitSelf(authorizedUser, email)) {
                throw unauthorizedError(`You are not authorized to make this query.`);
            }
            
            const user: User | undefined = await getUserByEmail(email);
            
            if(!user){
                throw notFoundError(`no user with email ${email}`);
            }
            
            return user;
        }
    },
};