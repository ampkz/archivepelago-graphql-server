import { Correspondence, CorrespondenceI } from "../../archive/correspondence"
import { Auth, isPermitted } from "../../auth/authorization";
import { createCorrespondence, getCorrespondence } from "../../db/archive/crud-correspondence";
import { mutationFailed, serverFailed, unauthorizedError } from "../errors/errors";

export default {
    Query: {
        correspondence: async(_root: any, { correspondenceID }: any, { authorizedUser }: any) => {
            let correspondence: Correspondence | undefined;

            try{
                correspondence = await getCorrespondence(correspondenceID);
            }catch( error: any ){
                throw serverFailed(error.message);
            }

            return correspondence;
        }
    },

    Mutation: {
        createCorrespondence: async (_root: any, { input: { fromID, toID, correspondenceDate, correspondenceType } }: any, { authorizedUser }: any) => {
            if(!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)){
                throw unauthorizedError(`You are not authorized to make this mutation.`);
            }

            let correspondence: Correspondence | undefined;

            try {
                correspondence = await createCorrespondence({ fromID, toID, correspondenceDate, correspondenceType} as CorrespondenceI)
            }catch( error: any ){
                throw mutationFailed(error.message);
            }

            return correspondence;
        }
    }
}