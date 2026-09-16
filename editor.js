(() => {
  const form = document.getElementById("content-form");
  const status = document.getElementById("status");
  let original;

  const getPath = (object, path) => path.split(".").reduce((value, key) => value[key], object);
  const setPath = (object, path, value) => {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((value, key) => value[key], object);
    target[last] = value;
  };

  const pairsToText = (items, secondKey) => items.map((item) => `${item.label} | ${item[secondKey]}`).join("\n");
  const parsePairs = (value, secondKey) => value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [label, ...rest] = line.split("|");
    return { label: label.trim(), [secondKey]: rest.join("|").trim() };
  }).filter((item) => item.label && item[secondKey]);

  const displayValue = (value, format) => {
    if (format === "lines") return value.join("\n");
    if (format === "links") return pairsToText(value, "url");
    if (format === "text-pairs") return pairsToText(value, "text");
    if (format === "single-link") return `${value.label} | ${value.url}`;
    return value;
  };

  const readValue = (field) => {
    const value = field.value.trim();
    if (field.dataset.format === "lines") return value.split("\n").map((line) => line.trim()).filter(Boolean);
    if (field.dataset.format === "links") return parsePairs(value, "url");
    if (field.dataset.format === "text-pairs") return parsePairs(value, "text");
    if (field.dataset.format === "single-link") return parsePairs(value, "url")[0] || { label: "", url: "" };
    return value;
  };

  const populate = (content) => {
    form.querySelectorAll("[data-path]").forEach((field) => {
      field.value = displayValue(getPath(content, field.dataset.path), field.dataset.format);
    });
  };

  const collect = () => {
    const content = structuredClone(original);
    form.querySelectorAll("[data-path]").forEach((field) => setPath(content, field.dataset.path, readValue(field)));
    return content;
  };

  const load = async () => {
    original = await fetch("content.json", { cache: "no-store" }).then((response) => response.json());
    populate(original);
  };

  form.addEventListener("input", () => {
    status.textContent = "Alterações ainda não baixadas";
  });

  document.getElementById("reset").addEventListener("click", () => {
    populate(original);
    status.textContent = "Alterações descartadas";
  });

  document.getElementById("preview").addEventListener("click", () => {
    sessionStorage.setItem("site-content-preview", JSON.stringify(collect()));
    window.open("index.html?preview=1", "site-preview");
    status.textContent = "Prévia aberta em outra aba";
  });

  document.getElementById("download").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(collect(), null, 2) + "\n"], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "content.json";
    link.click();
    URL.revokeObjectURL(link.href);
    status.textContent = "Arquivo baixado. Substitua content.json no GitHub.";
  });

  load().catch(() => {
    status.textContent = "Não foi possível carregar content.json";
  });
})();
