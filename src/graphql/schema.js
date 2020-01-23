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
    page (title: String!): Page!
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
    addOrderedSectionToPage(title: String!, beforeSection: ID!, section: SectionInput!, sections: [ID!]!): Page!
    removeSection(id: ID!): Page!
    updateSection(id: ID!, section: SectionInput!): Section!
  }
`;