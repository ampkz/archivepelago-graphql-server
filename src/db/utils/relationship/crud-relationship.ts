import { Driver, RecordShape, Session } from "neo4j-driver";
import { Relationship } from "../../../archive/relationship/relationship";
import { connect } from "../connection";
import { getSessionOptions } from "../../../_helpers/db-helper";
import { InternalError } from "../../../_helpers/errors-helper";

export enum Errors {
    COULD_NOT_CREATE_RELATIONSHIP = "Could not create relationship.",
    COULD_NOT_DELETE_RELATIONSHIP = "Could not delete relationship."
}

export async function createRelationship(relationship: Relationship, dbName: string = process.env.ARCHIVE_DB as string): Promise<Relationship | undefined>{
    const driver: Driver = await connect();
    const session: Session = driver.session(getSessionOptions(dbName));

    const match: RecordShape = await session.run(`MATCH (f:${relationship.node1.nodeType} {${relationship.node1.getIdString()}}), (s:${relationship.node2.nodeType} {${relationship.node2.getIdString()}}) CREATE (f)-[:${relationship.name}]->(s)`, relationship.getRelationshipParams());

    if(match.summary.counters._stats.relationshipsCreated !== 1){
        
        await session.close();
        await driver.close();

        throw new InternalError(Errors.COULD_NOT_CREATE_RELATIONSHIP)
    }

    await session.close();
    await driver.close();
    return relationship;
}

export async function deleteRelationship(relationship: Relationship, dbName: string = process.env.ARCHIVE_DB as string): Promise<Relationship | undefined>{
    const driver: Driver = await connect();
    const session: Session = driver.session(getSessionOptions(dbName));

    const match: RecordShape = await session.run(`MATCH (:${relationship.node1.nodeType} {${relationship.node1.getIdString()}})-[r:${relationship.name}]->(:${relationship.node2.nodeType} {${relationship.node2.getIdString()}}) DELETE r`, relationship.getRelationshipParams());

    if(match.summary.counters._stats.relationshipsDeleted !== 1){
        await session.close();
        await driver.close();

        throw new InternalError(Errors.COULD_NOT_DELETE_RELATIONSHIP);
    }

    await session.close();
    await driver.close();
    return relationship;
}