import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: any;
};

export type Query = {
  __typename?: 'Query';
  users?: Maybe<UserNodeConnection>;
  me?: Maybe<UserNode>;
  problems?: Maybe<ProblemNodeConnection>;
  /** The ID of the object */
  node?: Maybe<Node>;
};


export type QueryUsersArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};


export type QueryProblemsArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
};

export type UserNodeConnection = {
  __typename?: 'UserNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<UserNodeEdge>>;
};

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
};

/** A Relay edge containing a `UserNode` and its cursor. */
export type UserNodeEdge = {
  __typename?: 'UserNodeEdge';
  /** The item at the end of the edge */
  node?: Maybe<UserNode>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
};

export type UserNode = Node & {
  __typename?: 'UserNode';
  password: Scalars['String'];
  lastLogin?: Maybe<Scalars['DateTime']>;
  /** Designates that this user has all permissions without explicitly assigning them. */
  isSuperuser: Scalars['Boolean'];
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  /** Designates whether the user can log into this admin site. */
  isStaff: Scalars['Boolean'];
  /** Designates whether this user should be treated as active. Unselect this instead of deleting accounts. */
  isActive: Scalars['Boolean'];
  dateJoined: Scalars['DateTime'];
  /** The ID of the object. */
  id: Scalars['ID'];
  problemSet: ProblemNodeConnection;
};


export type UserNodeProblemSetArgs = {
  before?: Maybe<Scalars['String']>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
};

/** An object with an ID */
export type Node = {
  /** The ID of the object. */
  id: Scalars['ID'];
};


export type ProblemNodeConnection = {
  __typename?: 'ProblemNodeConnection';
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ProblemNodeEdge>>;
};

/** A Relay edge containing a `ProblemNode` and its cursor. */
export type ProblemNodeEdge = {
  __typename?: 'ProblemNodeEdge';
  /** The item at the end of the edge */
  node?: Maybe<ProblemNode>;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
};

export type ProblemNode = Node & {
  __typename?: 'ProblemNode';
  /** The ID of the object. */
  id: Scalars['ID'];
  name: Scalars['String'];
  setter: UserNode;
  comment: Scalars['String'];
  gridWidth: Scalars['Int'];
  gridHeight: Scalars['Int'];
  startHolds?: Maybe<Array<Scalars['Int']>>;
  holds?: Maybe<Array<Scalars['Int']>>;
  endHolds?: Maybe<Array<Scalars['Int']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  logout?: Maybe<Logout>;
  /** Returns a user on succesful login. Otherwise null. */
  login?: Maybe<LoginPayload>;
};


export type MutationLoginArgs = {
  input: LoginInput;
};

export type Logout = {
  __typename?: 'Logout';
  success?: Maybe<Scalars['Boolean']>;
};

/** Returns a user on succesful login. Otherwise null. */
export type LoginPayload = {
  __typename?: 'LoginPayload';
  user?: Maybe<UserNode>;
  clientMutationId?: Maybe<Scalars['String']>;
};

export type LoginInput = {
  username: Scalars['String'];
  password: Scalars['String'];
  clientMutationId?: Maybe<Scalars['String']>;
};

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login?: Maybe<(
    { __typename?: 'LoginPayload' }
    & { user?: Maybe<(
      { __typename?: 'UserNode' }
      & Pick<UserNode, 'password' | 'username'>
    )> }
  )> }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & { logout?: Maybe<(
    { __typename?: 'Logout' }
    & Pick<Logout, 'success'>
  )> }
);

export type GetProblemsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProblemsQuery = (
  { __typename?: 'Query' }
  & { problems?: Maybe<(
    { __typename?: 'ProblemNodeConnection' }
    & { edges: Array<Maybe<(
      { __typename?: 'ProblemNodeEdge' }
      & { node?: Maybe<(
        { __typename?: 'ProblemNode' }
        & Pick<ProblemNode, 'name'>
      )> }
    )>> }
  )> }
);


export const LoginDocument = gql`
    mutation login($input: LoginInput!) {
  login(input: $input) {
    user {
      password
      username
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, baseOptions);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation logout {
  logout {
    success
  }
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, baseOptions);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const GetProblemsDocument = gql`
    query getProblems {
  problems {
    edges {
      node {
        name
      }
    }
  }
}
    `;

/**
 * __useGetProblemsQuery__
 *
 * To run a query within a React component, call `useGetProblemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProblemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProblemsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetProblemsQuery(baseOptions?: Apollo.QueryHookOptions<GetProblemsQuery, GetProblemsQueryVariables>) {
        return Apollo.useQuery<GetProblemsQuery, GetProblemsQueryVariables>(GetProblemsDocument, baseOptions);
      }
export function useGetProblemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProblemsQuery, GetProblemsQueryVariables>) {
          return Apollo.useLazyQuery<GetProblemsQuery, GetProblemsQueryVariables>(GetProblemsDocument, baseOptions);
        }
export type GetProblemsQueryHookResult = ReturnType<typeof useGetProblemsQuery>;
export type GetProblemsLazyQueryHookResult = ReturnType<typeof useGetProblemsLazyQuery>;
export type GetProblemsQueryResult = Apollo.QueryResult<GetProblemsQuery, GetProblemsQueryVariables>;