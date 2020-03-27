import { gql } from "apollo-boost";

export const typeDefs = gql`
  type Query {
    myUser: User!
    allScores: [Score!]!
  }

  type Mutation {
    createUser(name: String!): User!
    publishScore(score: Int!, message: String): Bool!
  }

  type User {
    id: ID!
    username: String!
    scores: [Score!]!
  }

  type Score {
    score: Int!
    message: String!

    user: User!
  }
`;
