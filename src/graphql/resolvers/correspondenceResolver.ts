import { Correspondence, ICorrespondence } from "../../archive/correspondence"
import { convertArchiveDateToDate, convertDateStringToArchiveDate } from "../../archive/date";
import { RelationshipType } from "../../archive/relationship/relationship";
import { Auth, isPermitted } from "../../auth/authorization";
import { createCorrespondence, deleteCorrespondence, getCorrespondence, getCorrespondences, updateCorrespondence } from "../../db/archive/crud-correspondence";
import { createPersonRelationship, deletePersonRelationship, getPersonsByCorrespondence } from "../../db/archive/relationship/person-correspondence-relationship";
import { mutationFailed, serverFailed, unauthorizedError } from "../errors/errors";

export default {
    Query: {
        correspondence: async(_root: any, { correspondenceID }: any) => {
            let correspondence: Correspondence | undefined;

            try{
                correspondence = await getCorrespondence(correspondenceID);
            }catch( error: any ){
                throw serverFailed(error.message);
            }

            if(correspondence !== undefined){
                return {... correspondence, correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate), correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate)}
            }

            return undefined;
        },

        correspondences: async () => {
            let correspondences: Correspondence[] = [];
            const convertedCorrespondences: any[] = [];

            try{
                correspondences = await getCorrespondences();
            }catch( error: any ){
                throw serverFailed(error.message);
            }

            correspondences.map((correspondence) => {
                convertedCorrespondences.push({... correspondence, correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate), correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate)}); 
            })

            return convertedCorrespondences;
        }
    },

    Mutation: {
        createCorrespondence: async (_root: any, { input: { correspondenceDate, correspondenceEndDate, correspondenceType } }: any, { authorizedUser }: any) => {
            if(!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)){
                throw unauthorizedError(`You are not authorized to make this mutation.`);
            }

            let correspondence: Correspondence | undefined;

            try {
                correspondence = await createCorrespondence({ correspondenceDate: convertArchiveDateToDate(correspondenceDate), correspondenceEndDate: convertArchiveDateToDate(correspondenceEndDate), correspondenceType } as ICorrespondence)
            }catch( error: any ){
                throw mutationFailed(error.message);
            }

            if(correspondence !== undefined){
                return {... correspondence, correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate), correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate)}
            }

            return undefined;
        },

        deleteCorrespondence: async (_root: any, { correspondenceID }: any, { authorizedUser }: any) => {
            if(!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)){
                throw unauthorizedError(`You are not authorized to make this mutation.`);
            }

            let correspondence: Correspondence | undefined;

            try {
                correspondence = await deleteCorrespondence(correspondenceID);
            }catch( error: any ){
                throw mutationFailed(error.message);
            }

            if(correspondence !== undefined){
                return {... correspondence, correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate), correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate)}
            }

            return undefined;
        },

        updateCorrespondence: async (_root: any, { input: { correspondenceID, updatedCorrespondenceDate, updatedCorrespondenceEndDate, updatedCorrespondenceType }}: any, { authorizedUser }: any) => {
            if(!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)){
                throw unauthorizedError(`You are not authorized to make this mutation.`);
            }

            let correspondence: Correspondence | undefined;

            try {
                correspondence = await updateCorrespondence({correspondenceID, updatedCorrespondenceDate: convertArchiveDateToDate(updatedCorrespondenceDate), updatedCorrespondenceType, updatedCorrespondenceEndDate: convertArchiveDateToDate(updatedCorrespondenceEndDate) });
            }catch( error: any ){
                throw mutationFailed(error.message);
            }

            if(correspondence !== undefined){
                return {... correspondence, correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate), correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate)}
            }

            return undefined;
        },

        addReceived: async (_root: any, { correspondenceID, receivedID }: any, { authorizedUser }: any) => {
            if(!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)){
                throw unauthorizedError(`You are not authorized to make this mutation.`);
            }

            let correspondence: Correspondence | undefined;

            try {
                correspondence = await createPersonRelationship(correspondenceID, receivedID, RelationshipType.RECEIVED);
            }catch( error: any ){
                throw mutationFailed(error.message);
            }

            if(correspondence !== undefined){
                return {... correspondence, correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate), correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate)}
            }

            return undefined;
        },

        removeReceived: async (_root: any, { correspondenceID, receivedID }: any, { authorizedUser }: any) => {
            if(!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)){
                throw unauthorizedError(`You are not authorized to make this mutation.`);
            }

            let correspondence: Correspondence | undefined;

            try {
                correspondence = await deletePersonRelationship(correspondenceID, receivedID, RelationshipType.RECEIVED);
            }catch( error: any ){
                throw mutationFailed(error.message);
            }

            if(correspondence !== undefined){
                return {... correspondence, correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate), correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate)}
            }

            return undefined;
        },

        addSent: async (_root: any, { correspondenceID, sentID }: any, { authorizedUser }: any) => {
            if(!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)){
                throw unauthorizedError(`You are not authorized to make this mutation.`);
            }

            let correspondence: Correspondence | undefined;

            try {
                correspondence = await createPersonRelationship(correspondenceID, sentID, RelationshipType.SENT);
            }catch( error: any ){
                throw mutationFailed(error.message);
            }

            if(correspondence !== undefined){
                return {... correspondence, correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate), correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate)}
            }

            return undefined;
        },

        removeSent: async (_root: any, { correspondenceID, sentID }: any, { authorizedUser }: any) => {
            if(!isPermitted(authorizedUser, Auth.ADMIN, Auth.CONTRIBUTOR)){
                throw unauthorizedError(`You are not authorized to make this mutation.`);
            }

            let correspondence: Correspondence | undefined;

            try {
                correspondence = await deletePersonRelationship(correspondenceID, sentID, RelationshipType.SENT);
            }catch( error: any ){
                throw mutationFailed(error.message);
            }

            if(correspondence !== undefined){
                return {... correspondence, correspondenceDate: convertDateStringToArchiveDate(correspondence?.correspondenceDate), correspondenceEndDate: convertDateStringToArchiveDate(correspondence.correspondenceEndDate)}
            }

            return undefined;
        },
    },

    Correspondence: {
        to: (correspondence: Correspondence) => getPersonsByCorrespondence(correspondence.correspondenceID, RelationshipType.RECEIVED),
        from: (Correspondence: Correspondence) => getPersonsByCorrespondence(Correspondence.correspondenceID, RelationshipType.SENT),
    }
}