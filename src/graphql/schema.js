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
    getId: User!
    getPageTitle(title: String!): [String!]!
    getUsername(username: String!): [String!]!
    getUserInfo(username: String!): [User!]!
    
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
    roleUpdate(currentRole: String!, agentAddress: ID!, newRole:String!): String!
  }
  type Role {
    name: String!
    members: [User!]!
  }

  extend type Query {
    allUsers: [User!]!
  }

  type User {
    id:ID!
    userName: String!
    role: String!
  }

  extend type Mutation {
    createRole(name: String!): Role!
    assignToRole(roleName: String!, agentId: ID!): Role!
    unassignToRole(roleName: String!, agentId: ID!): Role!
    createUser(name: String!): User!
  }
`;
