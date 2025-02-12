import { Driver, Neo4jError, RecordShape, Session } from "neo4j-driver";
import { connect } from "./connection";
import { getSessionOptions } from "../../_helpers/db-helper";
import { InternalError } from "../../_helpers/errors-helper";

export enum Errors {
    CANNOT_CREATE_NODE = 'Cannot Create Node',
    CANNOT_MATCH_NODE = 'Cannot Match Node',
    CANNOT_DELETE_NODE = 'Cannot Delete Node',
    CANNOT_UPDATE_NODE = 'Cannot Update Node',
}

export async function createNode(nodeName: string, props: string[], params: object, dbName: string = (process.env.ARCHIVE_DB as string)): Promise<object | undefined> {
    const driver: Driver = await connect();
    const session: Session = driver.session(getSessionOptions(dbName));

    let createdNode: object | undefined = undefined;

    try{
        const match: RecordShape = await session.run(`CREATE(n:${ nodeName } { ${ props.join() } }) RETURN n`, params);

        if(match.summary.counters._stats.nodesCreated !== 1){
            await session.close();
            await driver.close();

            throw new InternalError(Errors.CANNOT_CREATE_NODE);
        }else{
            createdNode = match.records[0].get(0).properties;
        }
    }catch ( error: unknown ){
        await session.close();
        await driver.close();

        let data = {};

        if(error instanceof Neo4jError){
            data = { info: error.code };
        }

        throw new InternalError(Errors.CANNOT_CREATE_NODE, data);
    }

    await session.close();
    await driver.close();

    return createdNode;
}

export async function getNode(nodeName: string, idProp: string, params: object, dbName: string = (process.env.ARCHIVE_DB as string), existingSession?: Session): Promise<any | undefined> {
    let driver: Driver | undefined = undefined;
    let session: Session;
    
    if(existingSession){
        session = existingSession;
    }else{
        driver = await connect();
        session = driver.session(getSessionOptions(dbName));
    }

    let matchedNode: any | undefined = undefined;

    try{
        const match: RecordShape = await session.run(`MATCH(n:${nodeName} { ${idProp }}) RETURN n`, params);
        
        if(match.records.length === 1){
            matchedNode = match.records[0].get(0).properties;
        }
    }catch ( error: unknown ){
        if(driver){
            await session.close();
            await driver.close();
        }

        let data = {};

        if(error instanceof Neo4jError){
            data = { info: error.code };
        }

        throw new InternalError(Errors.CANNOT_MATCH_NODE, data);
    }

    if(driver){
        await session.close();
        await driver.close();
    }

    return matchedNode;
}

export async function deleteNode(nodeName: string, idProp: string, params: object, dbName: string = (process.env.ARCHIVE_DB as string)): Promise<any | undefined> {
    const driver: Driver = await connect();
    const session: Session = driver.session(getSessionOptions(dbName));

    const matchedNode: any | undefined = await getNode(nodeName, idProp, params, dbName, session);

    if(matchedNode){
        let match: RecordShape
        
        try{
            match = await session.run(`MATCH(n:${nodeName} { ${idProp }}) DELETE n`, params);

            if(match.summary.counters._stats.nodesDeleted !== 1){
                await session.close();
                await driver.close();
                throw new InternalError(Errors.CANNOT_DELETE_NODE);
            }
        }catch( error: unknown ){
            let data = {};

            if(error instanceof Neo4jError){
                data = { info: error.code };
            }

            await session.close();
            await driver.close();

            throw new InternalError(Errors.CANNOT_DELETE_NODE, data);
        }
    }

    await session.close();
    await driver.close();

    return matchedNode;
}

// idProp should have a corresponding property name in the params obj
// e.g. if idProp = "email", the params object should at least contain { email: "some@email.com" }
export async function updateNode(nodeName: string, nodePrefix: string, idProp: string, updatedProps: string[], params: object, dbName: string = (process.env.ARCHIVE_DB as string)): Promise<any | undefined> {
    const driver: Driver = await connect();
    const session: Session = driver.session(getSessionOptions(dbName));
    
    let match: RecordShape | undefined = undefined;

    try{
        match = await session.run(`MATCH(${nodePrefix}:${nodeName} { ${idProp}: $${idProp} }) SET ${ updatedProps.join() } RETURN ${nodePrefix}`, params);
    }catch ( error: unknown ) {
        let data = {};

        if(error instanceof Neo4jError){
            data = { info: error.code };
        }

        await session.close();
        await driver.close();

        throw new InternalError(Errors.CANNOT_UPDATE_NODE, data);
    }
    
    
    if(match && match.records.length === 0) {
        await session.close();
        await driver.close();

        return undefined;
    }

    await session.close();
    await driver.close();

    return match.records[0].get(0).properties;
}