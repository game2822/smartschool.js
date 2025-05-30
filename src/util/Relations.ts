import { RelationshipData } from "../types/RequestHandler";

interface SingleRelation<T extends string> { id: string; type: T; }

export function getSingleRelation<T extends string>(
    rel?: RelationshipData<T>
): SingleRelation<T> | undefined {
    return rel && !Array.isArray(rel.data) ? rel.data : undefined;
}

export const getMultipleRelations = <T extends string>(
    rel?: RelationshipData<T>
): Array<SingleRelation<T>> => rel && Array.isArray(rel.data) ? rel.data : [];
