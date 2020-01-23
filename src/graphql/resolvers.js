async function getSections(vec, callZome) {
  var sections = [];
  for (var i in vec) {
    await callZome(
      "__H_Wiki",
      "wiki",
      "get_section"
    )({ address: vec[i] }).then(section => {
      section = JSON.parse(section).Ok;
      section.id = vec[i];
      delete section.page_address;

      sections.push(section);
    });
  }
  return sections;
}

async function page(title, callZome) {
  var sections = [];
  await callZome(
    "__H_Wiki",
    "wiki",
    "get_page"
  )({ title: title }).then(page => {
    page = JSON.parse(page);
    console.log(page);
    page = page.Ok;
    sections = page.sections;
  });
  return {
    title,
    sections: getSections(sections, callZome)
  };
}

export const resolvers = {
  Query: {
    async homePage(_, __, { callZome }) {
      var page;
      await callZome(
        "__H_Wiki",
        "wiki",
        "get_home_page"
      )({}).then(response => {
        response = JSON.parse(response);
        if (response.Err) {
          page = {
            title: "Welcome to H-wiki",
            sections: [
              {
                id: 1,
                type: "text",
                content: "",
                rendered_content: "text/html",
                noLinks: true
              }
            ]
          };
        } else {
          let sections = response.Ok.sections;
          page = {
            title: response.Ok.title,
            sections: []
          };

          if (!sections.length) {
            page.sections[0] = {
              id: 0,
              type: "text",
              content: "No pages have been created",
              rendered_content: "<p>No pages have been created</p>"
            };
          } else {
            for (const key in sections) {
              page.sections.push({
                id: key,
                type: sections[key].type,
                content: sections[key].content,
                rendered_content: "sections[key].element_type"
              });
            }
          }
        }
      });

      return page;
    },
    async page(_, { title }, { callZome }) {
      return await page(title, callZome);
    }
  },
  Mutation: {
    async createPageWithSections(a, { title, sections }, { callZome }) {
      await callZome(
        "__H_Wiki",
        "wiki",
        "create_page_with_sections"
      )({ title,  sections }).then(res => {
      });
      return await page(title, callZome);
    },

    async addSectionToPage(a, { title, section }, { callZome }) {
      await callZome("__H_Wiki", "wiki", "add_section")
      ({title, element: section})
      .then(res => {});
      
      return await page(title, callZome);
    },

    async addOrderedSectionToPage(a, {title, beforeSection, section, sections}, { callZome }) {
      var id, currentPage;

      await callZome("__H_Wiki", "wiki", "add_section")
      ({title, element: section})
      .then(res => { id = JSON.parse(res).Ok; });

      var i = parseInt(sections.indexOf(beforeSection));
      i+=1;
      sections.splice(i, 0, id);

      await callZome("__H_Wiki","wiki","update_page")
      ({sections, title})
      .then(res => { currentPage = page(title, callZome); });

      return currentPage;
    },

    async updateSection(a, { id, section }, { callZome }) {
      await callZome(
        "__H_Wiki",
        "wiki",
        "update_element"
      )({ address: id, element: section }).then(res => {
      });

      section.id = id;

      return section;
    },

    async removeSection(a, { id }, { callZome }) {
      var title;
      await callZome(
        "__H_Wiki",
        "wiki",
        "delete_element"
      )({ address: id }).then(res => {
        title = JSON.parse(res).Ok;
      });
      return page(title, callZome)
    }
  }
};