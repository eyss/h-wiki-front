var id;
export const resolvers = {
  Query: {
    async page(_, { title }, __) {
      return title;
    },
    allPages(_, __, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "get_titles"
      )({}).then(page => {
        page = JSON.parse(page);
        if (page.Ok) {
          return page.Ok;
        } else {
          return [];
        }
      });
    },
    allUsers(_, __, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "get_usernames"
      )({}).then(page => {
        page = JSON.parse(page);
        if (page.Ok) {
          return page.Ok;
        } else {
          return [];
        }
      });
    },
    allRoles(_, __, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "get_all_roles"
      )({}).then(page => {
        page = JSON.parse(page);
        if (page.Ok) {
          return page.Ok;
        } else {
          return [];
        }
      });
    }
  },
  User: {
    userName: userName => userName,
    roles(user_name, __, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "get_agent_user"
      )({ user_name })
        .then(page => {
          page = JSON.parse(page);

          if (page.Ok) {
            return callZome(
              "__H_Wiki",
              "wiki",
              "get_all_roles"
            )({}).then(roles => {
              roles = JSON.parse(roles).Ok;
              console.log("roles", roles);
              return roles.filter(role => role.members.includes(page.Ok));
            });
          } else {
            throw new Error(page.Err);
          }
        })
        .then(page => {
          console.log("page.Ok", page);
          return page;
        })
        .catch(e => {
          console.log("e", e);
          return [];
        });
    }
  },
  Role: {
    name: ({ role_name }) => role_name,
    members({ members }, __, { callZome }) {
      return members.map(id =>
        callZome(
          "__H_Wiki",
          "wiki",
          "get_user_by_agent_id"
        )({ agent_id: id }).then(page => {
          page = JSON.parse(page);

          if (page.Ok) {
            return page.Ok;
          } else {
            throw new Error(page.Err);
          }
        })
      );
    }
  },
  Page: {
    title(title) {
      return title;
    },
    sections(title, __, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "get_page"
      )({ title: title }).then(page => {
        page = JSON.parse(page);

        if (page.Ok) {
          return page.Ok.sections;
        } else {
          throw new Error(page.Err);
        }
      });
    }
  },
  Section: {
    id(id) {
      return id;
    },
    type(id, __, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "get_section"
      )({ address: id }).then(page => {
        page = JSON.parse(page);
        if (page.Ok) {
          return page.Ok.type;
        } else {
          throw new Error(page.Err);
        }
      });
    },
    content(id, __, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "get_section"
      )({ address: id }).then(page => {
        page = JSON.parse(page);
        if (page.Ok) {
          return page.Ok.content;
        } else {
          throw new Error(page.Err);
        }
      });
    },
    rendered_content(id, __, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "get_section"
      )({ address: id }).then(page => {
        page = JSON.parse(page);
        if (page.Ok) {
          return page.Ok.rendered_content;
        } else {
          throw new Error(page.Err);
        }
      });
    }
  },
  Mutation: {
    async createPageWithSections(a, { title, sections }, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "create_page_with_sections"
      )({ title, sections }).then(res => {
        if (JSON.parse(res).Ok) {
          return title;
        } else {
          throw new Error(JSON.parse(res).Err);
        }
      });
    },

    async addSectionToPage(a, { title, section }, { callZome }) {
      await callZome(
        "__H_Wiki",
        "wiki",
        "add_section"
      )({ title, element: section }).then(res => {
        id = [JSON.parse(res).Ok];
      });

      return callZome(
        "__H_Wiki",
        "wiki",
        "update_page"
      )({ sections: id, title }).then(res => {
        if (JSON.parse(res).Ok) {
          return title;
        } else {
          throw new Error(JSON.parse(res).Err);
        }
      });
    },

    async addOrderedSectionToPage(
      a,
      { title, beforeSection, section, sections, mode },
      { callZome }
    ) {
      await callZome(
        "__H_Wiki",
        "wiki",
        "add_section"
      )({ title, element: section }).then(res => {
        id = JSON.parse(res).Ok;
      });

      if (mode === "addsa") {
        let sectionsUpdate;
        sectionsUpdate = [id, ...sections];
        sections = [];
        sections = sectionsUpdate;
      } else if (mode === "addsb") {
        let i = parseInt(sections.indexOf(beforeSection));
        i += 1;
        sections.splice(i, 0, id);
      }

      return callZome(
        "__H_Wiki",
        "wiki",
        "update_page"
      )({ sections, title }).then(res => {
        if (JSON.parse(res).Ok) {
          return title;
        } else {
          throw new Error(JSON.parse(res).Err);
        }
      });
    },

    async updateSection(a, { id, section }, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "update_element"
      )({ address: id, element: section }).then(res => {
        if (JSON.parse(res).Ok) {
          return id;
        } else {
          throw new Error(JSON.parse(res).Err);
        }
      });
    },

    async removeSection(a, { id }, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "delete_element"
      )({ address: id }).then(res => {
        if (JSON.parse(res).Ok) {
          return JSON.parse(res).Ok;
        } else {
          throw new Error(JSON.parse(res).Err);
        }
      });
    },
    async createUser(a, { name }, { callZome }) {
      return callZome(
        "__H_Wiki",
        "wiki",
        "create_user"
      )({ data: name }).then(res => {
        if (JSON.parse(res).Ok) {
          return JSON.parse(res).Ok;
        } else {
          throw new Error(JSON.parse(res).Err);
        }
      });
    }
  }
};
