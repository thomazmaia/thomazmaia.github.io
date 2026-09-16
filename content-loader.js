(() => {
  const byId = (id) => document.getElementById(id);
  const setText = (id, value) => {
    const element = byId(id);
    if (element && typeof value === "string") element.textContent = value;
  };

  const externalLink = (item, className = "") => {
    const link = document.createElement("a");
    link.textContent = `${item.label} ↗`;
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    if (className) link.className = className;
    return link;
  };

  const renderTags = (id, tags = []) => {
    const container = byId(id);
    if (!container || !Array.isArray(tags)) return;
    container.replaceChildren(...tags.map((tag) => {
      const span = document.createElement("span");
      span.textContent = tag;
      return span;
    }));
  };

  const render = (content) => {
    document.title = content.meta.title;
    byId("meta-description").content = content.meta.description;
    setText("header-role", content.header.role);
    setText("header-location", content.header.location);
    setText("portrait-label", content.profile.portraitLabel);
    setText("profile-eyebrow", content.profile.eyebrow);
    setText("first-name", content.profile.firstName);
    setText("last-name", content.profile.lastName);
    setText("profile-bio", content.profile.bio);
    setText("profile-since", content.profile.since);

    const profileLinks = byId("profile-links");
    profileLinks.replaceChildren(...content.profile.links.map((item) => externalLink(item)));

    const { research, teaching, stack, education, personal, contact } = content.sections;
    setText("research-title", research.title);
    setText("research-code", research.code);
    setText("research-description", research.description);
    renderTags("research-tags", research.tags);
    setText("teaching-title", teaching.title);
    setText("teaching-code", teaching.code);
    setText("teaching-description", teaching.description);
    renderTags("teaching-tags", teaching.tags);

    setText("stack-title", stack.title);
    setText("stack-code", stack.code);
    byId("stack-groups").replaceChildren(...stack.groups.map((group) => {
      const paragraph = document.createElement("p");
      const label = document.createElement("b");
      label.textContent = group.label;
      paragraph.append(label, document.createTextNode(` ${group.text}`));
      return paragraph;
    }));

    setText("education-title", education.title);
    setText("education-code", education.code);
    byId("education-items").replaceChildren(...education.items.map((item) => {
      const row = document.createElement("li");
      const label = document.createElement("b");
      const text = document.createElement("span");
      label.textContent = item.label;
      text.textContent = item.text;
      row.append(label, text);
      return row;
    }));

    setText("personal-title", personal.title);
    setText("personal-code", personal.code);
    setText("personal-description", personal.description);
    renderTags("personal-tags", personal.tags);
    setText("contact-title", contact.title);
    setText("contact-code", contact.code);

    const emails = contact.emails.map((email) => {
      const link = document.createElement("a");
      link.href = `mailto:${email}`;
      link.textContent = email;
      return link;
    });
    byId("contact-links").replaceChildren(...emails, externalLink(contact.link, "nuven"));
    setText("footer-left", content.footer.left);
    setText("footer-right", content.footer.right);
  };

  const load = async () => {
    try {
      const preview = new URLSearchParams(location.search).has("preview");
      const stored = preview ? sessionStorage.getItem("site-content-preview") : null;
      const content = stored
        ? JSON.parse(stored)
        : await fetch("content.json", { cache: "no-store" }).then((response) => {
            if (!response.ok) throw new Error("Não foi possível carregar content.json");
            return response.json();
          });
      render(content);
    } catch (error) {
      console.warn("O conteúdo padrão do HTML será mantido.", error);
    }
  };

  load();
})();
