import { gql } from "apollo-boost";

export const typeDefs = gql`
  type Section {
    id: ID!
    type: String!
    content: String!
    rendered_content: String!
  }

  type Page {
    title: String!
    sections: [Section!]!
  }

  type Query {
    page(title: String!): Page!
    homePage: Page!
    allPages: [Page!]!
  }

  input SectionInput {
    type: String!
    content: String!
    rendered_content: String!
  }

  type Mutation {
    createPage(title: String!): Page!
    createPageWithSections(title: String!, sections: [SectionInput!]!): Page!
    addSectionToPage(title: String!, section: SectionInput!): Page!
    addOrderedSectionToPage(
      title: String!
      beforeSection: ID!
      section: SectionInput!
      sections: [ID!]!
      mode: String!
    ): Page!
    removeSection(id: ID!): Page!
    updateSection(id: ID!, section: SectionInput!): Section!
  }
  type Role {
    name: String!
    members: [User!]!
  }

  extend type Query {
    allRoles: [Role!]!
    allUsers: [User!]!
  }

  type User {
    userName: ID!
    roles: [Role!]!
  }

  extend type Mutation {
    createRole(name: String!): Role!
    assignToRole(roleName: String!, agentId: ID!): Role!
    unassignToRole(roleName: String!, agentId: ID!): Role!
    createUser(name: String!): User!
  }
`;
