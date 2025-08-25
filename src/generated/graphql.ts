import { GraphQLResolveInfo } from 'graphql';
import { MyContext } from '../server/server';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type ArchiveDate = {
  __typename?: 'ArchiveDate';
  day?: Maybe<Scalars['String']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  year: Scalars['String']['output'];
};

export type ArchiveDateInput = {
  day?: InputMaybe<Scalars['String']['input']>;
  month?: InputMaybe<Scalars['String']['input']>;
  year: Scalars['String']['input'];
};

export type Correspondence = {
  __typename?: 'Correspondence';
  correspondenceDate?: Maybe<ArchiveDate>;
  correspondenceEndDate?: Maybe<ArchiveDate>;
  correspondenceID: Scalars['ID']['output'];
  correspondenceType?: Maybe<CorrespondenceType>;
  from?: Maybe<Array<Person>>;
  to?: Maybe<Array<Person>>;
};

export enum CorrespondenceType {
  Letter = 'LETTER'
}

export type CreateCorrespondenceInput = {
  correspondenceDate?: InputMaybe<ArchiveDateInput>;
  correspondenceEndDate?: InputMaybe<ArchiveDateInput>;
  correspondenceType: CorrespondenceType;
};

export type CreateLabelInput = {
  name: Scalars['ID']['input'];
  type: LabelType;
};

export type CreatePersonInput = {
  birthDate?: InputMaybe<ArchiveDateInput>;
  deathDate?: InputMaybe<ArchiveDateInput>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  secondName?: InputMaybe<Scalars['String']['input']>;
};

export type Label = {
  __typename?: 'Label';
  name: Scalars['ID']['output'];
  persons?: Maybe<Array<Maybe<Person>>>;
  type: LabelType;
};

export enum LabelType {
  Nationality = 'NATIONALITY',
  Profession = 'PROFESSION',
  Sexuality = 'SEXUALITY'
}

export type Mutation = {
  __typename?: 'Mutation';
  addReceived?: Maybe<Correspondence>;
  addSent?: Maybe<Correspondence>;
  createCorrespondence?: Maybe<Correspondence>;
  createLabel?: Maybe<Label>;
  createLabelRelationship?: Maybe<Person>;
  createPerson?: Maybe<Person>;
  deleteCorrespondence?: Maybe<Correspondence>;
  deleteLabel?: Maybe<Label>;
  deleteLabelRelationship?: Maybe<Person>;
  deletePerson?: Maybe<Person>;
  removeReceived?: Maybe<Correspondence>;
  removeSent?: Maybe<Correspondence>;
  updateCorrespondence?: Maybe<Correspondence>;
  updateLabel?: Maybe<Label>;
  updatePerson?: Maybe<Person>;
};


export type MutationAddReceivedArgs = {
  correspondenceID: Scalars['ID']['input'];
  receivedID: Scalars['ID']['input'];
};


export type MutationAddSentArgs = {
  correspondenceID: Scalars['ID']['input'];
  sentID: Scalars['ID']['input'];
};


export type MutationCreateCorrespondenceArgs = {
  input: CreateCorrespondenceInput;
};


export type MutationCreateLabelArgs = {
  input: CreateLabelInput;
};


export type MutationCreateLabelRelationshipArgs = {
  labelName: Scalars['ID']['input'];
  personID: Scalars['ID']['input'];
};


export type MutationCreatePersonArgs = {
  input: CreatePersonInput;
};


export type MutationDeleteCorrespondenceArgs = {
  correspondenceID: Scalars['ID']['input'];
};


export type MutationDeleteLabelArgs = {
  name: Scalars['ID']['input'];
};


export type MutationDeleteLabelRelationshipArgs = {
  labelName: Scalars['ID']['input'];
  personID: Scalars['ID']['input'];
};


export type MutationDeletePersonArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveReceivedArgs = {
  correspondenceID: Scalars['ID']['input'];
  receivedID: Scalars['ID']['input'];
};


export type MutationRemoveSentArgs = {
  correspondenceID: Scalars['ID']['input'];
  sentID: Scalars['ID']['input'];
};


export type MutationUpdateCorrespondenceArgs = {
  input: UpdateCorrespondenceInput;
};


export type MutationUpdateLabelArgs = {
  input: UpdateLabelInput;
};


export type MutationUpdatePersonArgs = {
  input: UpdatePersonInput;
};

export type Person = {
  __typename?: 'Person';
  birthDate?: Maybe<ArchiveDate>;
  deathDate?: Maybe<ArchiveDate>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  labels?: Maybe<Array<Maybe<Label>>>;
  lastName?: Maybe<Scalars['String']['output']>;
  receivedCorrespondences?: Maybe<Array<Maybe<Correspondence>>>;
  secondName?: Maybe<Scalars['String']['output']>;
  sentCorrespondences?: Maybe<Array<Maybe<Correspondence>>>;
};

export type Query = {
  __typename?: 'Query';
  correspondence?: Maybe<Correspondence>;
  correspondences: Array<Correspondence>;
  from?: Maybe<Array<Person>>;
  label?: Maybe<Label>;
  labels: Array<Label>;
  person?: Maybe<Person>;
  persons: Array<Person>;
  to?: Maybe<Array<Person>>;
};


export type QueryCorrespondenceArgs = {
  correspondenceID: Scalars['ID']['input'];
};


export type QueryLabelArgs = {
  name: Scalars['ID']['input'];
};


export type QueryPersonArgs = {
  id: Scalars['ID']['input'];
};

export type UpdateCorrespondenceInput = {
  correspondenceID: Scalars['ID']['input'];
  updatedCorrespondenceDate?: InputMaybe<ArchiveDateInput>;
  updatedCorrespondenceEndDate?: InputMaybe<ArchiveDateInput>;
  updatedCorrespondenceType?: InputMaybe<CorrespondenceType>;
};

export type UpdateLabelInput = {
  name: Scalars['ID']['input'];
  updatedName?: InputMaybe<Scalars['ID']['input']>;
  updatedType?: InputMaybe<LabelType>;
};

export type UpdatePersonInput = {
  id: Scalars['ID']['input'];
  updatedBirthDate?: InputMaybe<ArchiveDateInput>;
  updatedDeathDate?: InputMaybe<ArchiveDateInput>;
  updatedFirstName?: InputMaybe<Scalars['String']['input']>;
  updatedLastName?: InputMaybe<Scalars['String']['input']>;
  updatedSecondName?: InputMaybe<Scalars['String']['input']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ArchiveDate: ResolverTypeWrapper<ArchiveDate>;
  ArchiveDateInput: ArchiveDateInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Correspondence: ResolverTypeWrapper<Correspondence>;
  CorrespondenceType: CorrespondenceType;
  CreateCorrespondenceInput: CreateCorrespondenceInput;
  CreateLabelInput: CreateLabelInput;
  CreatePersonInput: CreatePersonInput;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Label: ResolverTypeWrapper<Label>;
  LabelType: LabelType;
  Mutation: ResolverTypeWrapper<{}>;
  Person: ResolverTypeWrapper<Person>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateCorrespondenceInput: UpdateCorrespondenceInput;
  UpdateLabelInput: UpdateLabelInput;
  UpdatePersonInput: UpdatePersonInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ArchiveDate: ArchiveDate;
  ArchiveDateInput: ArchiveDateInput;
  Boolean: Scalars['Boolean']['output'];
  Correspondence: Correspondence;
  CreateCorrespondenceInput: CreateCorrespondenceInput;
  CreateLabelInput: CreateLabelInput;
  CreatePersonInput: CreatePersonInput;
  ID: Scalars['ID']['output'];
  Label: Label;
  Mutation: {};
  Person: Person;
  Query: {};
  String: Scalars['String']['output'];
  UpdateCorrespondenceInput: UpdateCorrespondenceInput;
  UpdateLabelInput: UpdateLabelInput;
  UpdatePersonInput: UpdatePersonInput;
};

export type ArchiveDateResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['ArchiveDate'] = ResolversParentTypes['ArchiveDate']> = {
  day?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  year?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CorrespondenceResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Correspondence'] = ResolversParentTypes['Correspondence']> = {
  correspondenceDate?: Resolver<Maybe<ResolversTypes['ArchiveDate']>, ParentType, ContextType>;
  correspondenceEndDate?: Resolver<Maybe<ResolversTypes['ArchiveDate']>, ParentType, ContextType>;
  correspondenceID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  correspondenceType?: Resolver<Maybe<ResolversTypes['CorrespondenceType']>, ParentType, ContextType>;
  from?: Resolver<Maybe<Array<ResolversTypes['Person']>>, ParentType, ContextType>;
  to?: Resolver<Maybe<Array<ResolversTypes['Person']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LabelResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Label'] = ResolversParentTypes['Label']> = {
  name?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  persons?: Resolver<Maybe<Array<Maybe<ResolversTypes['Person']>>>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['LabelType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addReceived?: Resolver<Maybe<ResolversTypes['Correspondence']>, ParentType, ContextType, RequireFields<MutationAddReceivedArgs, 'correspondenceID' | 'receivedID'>>;
  addSent?: Resolver<Maybe<ResolversTypes['Correspondence']>, ParentType, ContextType, RequireFields<MutationAddSentArgs, 'correspondenceID' | 'sentID'>>;
  createCorrespondence?: Resolver<Maybe<ResolversTypes['Correspondence']>, ParentType, ContextType, RequireFields<MutationCreateCorrespondenceArgs, 'input'>>;
  createLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationCreateLabelArgs, 'input'>>;
  createLabelRelationship?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<MutationCreateLabelRelationshipArgs, 'labelName' | 'personID'>>;
  createPerson?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<MutationCreatePersonArgs, 'input'>>;
  deleteCorrespondence?: Resolver<Maybe<ResolversTypes['Correspondence']>, ParentType, ContextType, RequireFields<MutationDeleteCorrespondenceArgs, 'correspondenceID'>>;
  deleteLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationDeleteLabelArgs, 'name'>>;
  deleteLabelRelationship?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<MutationDeleteLabelRelationshipArgs, 'labelName' | 'personID'>>;
  deletePerson?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<MutationDeletePersonArgs, 'id'>>;
  removeReceived?: Resolver<Maybe<ResolversTypes['Correspondence']>, ParentType, ContextType, RequireFields<MutationRemoveReceivedArgs, 'correspondenceID' | 'receivedID'>>;
  removeSent?: Resolver<Maybe<ResolversTypes['Correspondence']>, ParentType, ContextType, RequireFields<MutationRemoveSentArgs, 'correspondenceID' | 'sentID'>>;
  updateCorrespondence?: Resolver<Maybe<ResolversTypes['Correspondence']>, ParentType, ContextType, RequireFields<MutationUpdateCorrespondenceArgs, 'input'>>;
  updateLabel?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<MutationUpdateLabelArgs, 'input'>>;
  updatePerson?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<MutationUpdatePersonArgs, 'input'>>;
};

export type PersonResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']> = {
  birthDate?: Resolver<Maybe<ResolversTypes['ArchiveDate']>, ParentType, ContextType>;
  deathDate?: Resolver<Maybe<ResolversTypes['ArchiveDate']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  labels?: Resolver<Maybe<Array<Maybe<ResolversTypes['Label']>>>, ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receivedCorrespondences?: Resolver<Maybe<Array<Maybe<ResolversTypes['Correspondence']>>>, ParentType, ContextType>;
  secondName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sentCorrespondences?: Resolver<Maybe<Array<Maybe<ResolversTypes['Correspondence']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  correspondence?: Resolver<Maybe<ResolversTypes['Correspondence']>, ParentType, ContextType, RequireFields<QueryCorrespondenceArgs, 'correspondenceID'>>;
  correspondences?: Resolver<Array<ResolversTypes['Correspondence']>, ParentType, ContextType>;
  from?: Resolver<Maybe<Array<ResolversTypes['Person']>>, ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<QueryLabelArgs, 'name'>>;
  labels?: Resolver<Array<ResolversTypes['Label']>, ParentType, ContextType>;
  person?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<QueryPersonArgs, 'id'>>;
  persons?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType>;
  to?: Resolver<Maybe<Array<ResolversTypes['Person']>>, ParentType, ContextType>;
};

export type Resolvers<ContextType = MyContext> = {
  ArchiveDate?: ArchiveDateResolvers<ContextType>;
  Correspondence?: CorrespondenceResolvers<ContextType>;
  Label?: LabelResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};

