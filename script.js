const siteConfig = {
  researchmapApiBase: "https://api.researchmap.jp/fujimurakeiji",
  maxResearchItems: {
    papers: 4,
    books: 2,
    presentations: 3,
    activities: 2,
  },
  contactEmail: "info@fujimurakeiji.com",
  researchmapProfileUrlJa: "https://researchmap.jp/fujimurakeiji",
  researchmapProfileUrlEn: "https://researchmap.jp/fujimurakeiji?lang=en",
  profileProxyBase: "https://api.allorigins.win/raw?url=",
};

const lang = document.documentElement.lang === "en" ? "en" : "ja";
const ui = {
  ja: {
    authorsUnavailable: "Authors unavailable",
    dateUnavailable: "Date unavailable",
    journalUnavailable: "Journal not listed",
    untitled: "Untitled paper",
    peerReviewed: "Peer reviewed",
    publicRecord: "Public record",
    viewOnResearchmap: "researchmapで見る",
    paperError:
      "論文データの取得に失敗しました。時間をおいて再読み込みするか、researchmap を直接ご確認ください。",
    xFallback: "この表示環境では X タイムラインを埋め込めませんでした。",
    openX: "@KeijiFujimura を X で開く",
    formNeedsEmail:
      "script.js の contactEmail を実際のメールアドレスに変えると、このフォームからメール作成できます。",
    interestHeading: "研究テーマ",
    interestTail: "など",
    areasLoading: "研究分野を読み込んでいます。",
    areasEmpty: "研究分野は取得できませんでした。",
    historyLoading: "経歴を読み込んでいます。",
    historyEmpty: "経歴は取得できませんでした。",
    booksEmpty: "書籍は取得できませんでした。",
    presentationsEmpty: "学会発表は取得できませんでした。",
    activitiesEmpty: "その他の活動は取得できませんでした。",
    outputsError:
      "研究成果データの一部を取得できませんでした。時間をおいて再読み込みするか、researchmap を直接ご確認ください。",
  },
  en: {
    authorsUnavailable: "Authors unavailable",
    dateUnavailable: "Date unavailable",
    journalUnavailable: "Journal not listed",
    untitled: "Untitled paper",
    peerReviewed: "Peer reviewed",
    publicRecord: "Public record",
    viewOnResearchmap: "View on researchmap",
    paperError:
      "Failed to load publication data. Please reload later or check researchmap directly.",
    xFallback: "The X timeline could not be embedded in this view.",
    openX: "Open @KeijiFujimura on X",
    formNeedsEmail:
      "Set contactEmail in script.js to a real email address to make this form open a draft email.",
    interestHeading: "Research interests",
    interestTail: "and more",
    areasLoading: "Loading research areas.",
    areasEmpty: "Research areas could not be loaded.",
    historyLoading: "Loading career history.",
    historyEmpty: "Career history could not be loaded.",
    booksEmpty: "Books could not be loaded.",
    presentationsEmpty: "Presentations could not be loaded.",
    activitiesEmpty: "Other activities could not be loaded.",
    outputsError:
      "Some publication data could not be loaded. Please reload later or check researchmap directly.",
  },
}[lang];

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});

const animateBackground = () => {
  const progress =
    window.scrollY /
    Math.max(document.body.scrollHeight - window.innerHeight, 1);
  const ambientA = document.querySelector(".ambient-a");
  const ambientB = document.querySelector(".ambient-b");

  ambientA.style.transform = `translate3d(${progress * -90}px, ${progress * 120}px, 0)`;
  ambientB.style.transform = `translate3d(${progress * 90}px, ${progress * -80}px, 0)`;
};

window.addEventListener("scroll", animateBackground, { passive: true });
animateBackground();

const papersGrid = document.getElementById("papers-grid");
const booksList = document.getElementById("books-list");
const presentationsList = document.getElementById("presentations-list");
const activitiesList = document.getElementById("activities-list");

const formatAuthors = (authors) => {
  if (!Array.isArray(authors) || authors.length === 0) return ui.authorsUnavailable;
  return authors
    .slice(0, 4)
    .map((author) => (typeof author === "string" ? author : author?.name))
    .filter(Boolean)
    .join(", ");
};

const formatDate = (value) => {
  if (!value) return ui.dateUnavailable;
  return value;
};

const isJapanesePaper = (paper) =>
  Array.isArray(paper.languages) && paper.languages.includes("jpn");

const getPaperTitle = (paper) => {
  if (lang === "en") {
    return paper.paper_title?.en || paper.paper_title?.ja || ui.untitled;
  }

  if (isJapanesePaper(paper)) {
    return paper.paper_title?.ja || paper.paper_title?.en || ui.untitled;
  }

  return paper.paper_title?.en || paper.paper_title?.ja || ui.untitled;
};

const makePaperCard = (paper) => {
  const article = document.createElement("article");
  const title = getPaperTitle(paper);
  const authors = formatAuthors(paper.authors?.en || paper.authors?.ja);
  const journal =
    paper.publication_name?.en || paper.publication_name?.ja || ui.journalUnavailable;
  const date = formatDate(paper.publication_date);
  const url = paper.see_also?.[0]?.["@id"] || paper["@id"];
  const peerReviewed = paper.referee ? ui.peerReviewed : ui.publicRecord;

  article.innerHTML = `
    <span class="paper-meta">${date}</span>
    <h3>${title}</h3>
    <p>${authors}</p>
    <p>${journal}</p>
    <p class="paper-tag">${peerReviewed}</p>
    <p><a href="${url}" target="_blank" rel="noreferrer">${ui.viewOnResearchmap}</a></p>
  `;

  article.classList.add("reveal");
  observer.observe(article);
  return article;
};

const renderPapers = (items) => {
  papersGrid.innerHTML = "";
  items.slice(0, siteConfig.maxResearchItems.papers).forEach((paper) => {
    papersGrid.appendChild(makePaperCard(paper));
  });
};

const loadPapers = async () => {
  try {
    const data = await fetchApiJson("/published_papers", {
      limit: siteConfig.maxResearchItems.papers,
    });
    const items = Array.isArray(data.items) ? data.items : [];

    renderPapers(items);
  } catch (error) {
    papersGrid.innerHTML = `<article><p>${ui.paperError}</p></article>`;
    console.error(error);
  }
};

const heroSummary = document.getElementById("hero-summary");
const heroAffiliation = document.getElementById("hero-affiliation");
const profileBody = document.getElementById("profile-body");
const currentFocusBody = document.getElementById("current-focus-body");
const researchAreasList = document.getElementById("research-areas-list");
const careerHistoryList = document.getElementById("career-history-list");
const heroInterestLabel = document.querySelector(".hero-card p");
const heroInterestValue = document.querySelector(".hero-card strong");
const fixedHeroMessage =
  lang === "en"
    ? "English Education, ESP, Active Learning, and Meeting Competency."
    : "英語教育、ESP、アクティブ・ラーニング、Meeting Competency。";

const buildProfileUrl = (path = "") => {
  const suffix = lang === "en" ? "?lang=en" : "";
  return `https://researchmap.jp/fujimurakeiji${path}${suffix}`;
};

const buildApiUrl = (path = "", params = {}) => {
  const url = new URL(`${siteConfig.researchmapApiBase}${path}`);
  url.searchParams.set("format", "json");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const buildProxyCandidates = (url) => [
  url,
  `${siteConfig.profileProxyBase}${encodeURIComponent(url)}`,
  `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

const fetchWithTimeout = async (resource, timeoutMs = 7000) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(resource, { signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
};

const fetchApiJson = async (path = "", params = {}) => {
  const response = await fetchWithTimeout(buildApiUrl(path, params));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path || "profile"}: ${response.status}`);
  }
  return response.json();
};

const getLocalizedText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return cleanText(value);
  if (typeof value !== "object") return "";

  if (lang === "en") {
    return cleanText(
      value.en ||
        value["en-US"] ||
        value["en-GB"] ||
        value.ja ||
        value["ja-Kana"] ||
        ""
    );
  }

  return cleanText(value.ja || value["ja-Kana"] || value.en || "");
};

const getLocalizedPeople = (value) => {
  if (!value || typeof value !== "object") return [];
  const preferred = Array.isArray(value[lang]) ? value[lang] : null;
  const fallback = Array.isArray(value.ja) ? value.ja : Array.isArray(value.en) ? value.en : [];
  return (preferred || fallback)
    .map((person) => cleanText(person?.name || ""))
    .filter(Boolean);
};

const formatMonthRange = (fromDate, toDate) => {
  const openEnded = !toDate || toDate === "9999" || toDate === "9999-12";
  if (lang === "en") {
    if (!fromDate) return openEnded ? "Present" : toDate;
    return `${fromDate} - ${openEnded ? "Present" : toDate}`;
  }
  if (!fromDate) return openEnded ? "現在" : toDate;
  return `${fromDate} - ${openEnded ? "現在" : toDate}`;
};

const buildAffiliationLabel = (entry) => {
  const affiliation = getLocalizedText(entry?.affiliation);
  const job = getLocalizedText(entry?.job);
  if (lang === "en") {
    return [job, affiliation].filter(Boolean).join(", ");
  }
  return [affiliation, job].filter(Boolean).join(" ");
};

const fetchTextFromCandidates = async (candidates) => {
  for (const candidate of candidates) {
    try {
      const response = await fetchWithTimeout(candidate);
      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (typeof data.contents === "string" && data.contents.trim()) {
          return data.contents;
        }
      } else {
        const text = await response.text();
        if (text.trim()) {
          return text;
        }
      }
    } catch (_error) {
      continue;
    }
  }

  throw new Error("All profile fetch attempts failed");
};

const cleanText = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

const commonNoise = [
  "日本語 | English",
  "Japanese | English",
  "新規登録",
  "ログイン",
  "ホーム",
  "Home",
  "経歴",
  "研究キーワード",
  "研究分野",
  "論文",
  "Books etc",
  "MISC",
  "講演・口頭発表等",
  "Works(作品等)",
  "共同研究・競争的資金等の研究課題",
  "Research Areas",
  "Career History",
  "Research Interests",
  "Major papers",
  "書籍等出版物",
  "所属学協会",
  "委員歴",
  "学術貢献活動",
  "社会貢献活動",
  "カリキュラム開発",
  "Books and Other Publications",
  "Committee Memberships",
  "Academic Contributions",
  "Social Contributions",
];

const isNoiseText = (value) => {
  const text = cleanText(value);
  if (!text) return true;
  if (commonNoise.includes(text)) return true;
  if (/^(日本語|English|ホーム|Home|ログイン|新規登録)$/.test(text)) return true;
  if (text.length <= 1) return true;
  return false;
};

const stripTags = (value) => {
  const temp = document.createElement("div");
  temp.innerHTML = value;
  return cleanText(temp.textContent || "");
};

const findAffiliation = (doc) => {
  const labels = Array.from(doc.querySelectorAll("dt"));
  const target = labels.find((dt) => {
    const text = cleanText(dt.textContent || "");
    return text.includes("Affiliation") || text.includes("所属");
  });
  return target?.nextElementSibling ? cleanText(target.nextElementSibling.textContent) : "";
};

const extractSectionHtml = (html, sectionTitles) => {
  for (const sectionTitle of sectionTitles) {
    const sectionMatch = html.match(
      new RegExp(`${sectionTitle}\\s*<\\/h2>([\\s\\S]*?)(?:<h2|<\\/section>)`, "i")
    );
    if (sectionMatch?.[1]) {
      return sectionMatch[1];
    }
  }
  return "";
};

const extractTextListFromSection = (sectionHtml) => {
  if (!sectionHtml) return [];
  const fragment = document.createElement("div");
  fragment.innerHTML = sectionHtml;
  const anchorTexts = Array.from(
    fragment.querySelectorAll("a.rm-cv-list-title, .rm-cv-list-title, li")
  )
    .map((node) => cleanText(node.textContent || ""))
    .filter((text) => text && !isNoiseText(text));
  return [...new Set(anchorTexts)];
};

const parseDocument = (html) => {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
};

const pickContentRoot = (doc) => {
  const selectors = [
    "main .rm-cv-main",
    "main .rm-cv-content",
    "main .rm-cv-page",
    "main .container",
    "main",
    ".rm-cv-main",
    ".rm-cv-content",
    ".rm-cv-page",
    "#content",
    "body",
  ];

  for (const selector of selectors) {
    const node = doc.querySelector(selector);
    if (node) return node;
  }

  return doc.body;
};

const extractListFromDocument = (doc) => {
  const root = pickContentRoot(doc);
  const selectors = [
    "a.rm-cv-list-title",
    ".rm-cv-list-title",
    ".rm-cv-item-title",
    ".rm-cv-title",
    ".rm-cv-list-item-title",
    ".research-interests li",
    ".research-experience li",
    ".rm-cv-list li",
    ".rm-cv-item li",
    "section li",
  ];

  const values = Array.from(root.querySelectorAll(selectors.join(",")))
    .map((node) => cleanText(node.textContent || ""))
    .filter((text) => !isNoiseText(text));

  return [...new Set(values)];
};

const extractResearchInterestFallback = (html) => {
  const sectionHtml = extractSectionHtml(
    html,
    lang === "en" ? ["Research Interests"] : ["研究キーワード"]
  );
  const unique = extractTextListFromSection(sectionHtml).slice(0, 6);

  if (!unique.length) return "";
  if (lang === "en") {
    return `${ui.interestHeading}: ${unique.join(", ")} ${ui.interestTail}.`;
  }
  return `${ui.interestHeading}: ${unique.join("、")}${ui.interestTail}。`;
};

const renderAutoList = (element, items, emptyText) => {
  if (!element) return;
  element.innerHTML = "";
  const values = items.filter(Boolean);
  if (!values.length) {
    const li = document.createElement("li");
    li.textContent = emptyText;
    element.appendChild(li);
    return;
  }
  values.forEach((value) => {
    const li = document.createElement("li");
    li.textContent = value;
    element.appendChild(li);
  });
};

const renderOutputCards = (element, items, emptyText) => {
  if (!element) return;
  element.innerHTML = "";

  if (!items.length) {
    const card = document.createElement("article");
    card.className = "output-card";
    card.innerHTML = `<p>${emptyText}</p>`;
    element.appendChild(card);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "output-card reveal";
    const meta = item.meta ? `<p>${item.meta}</p>` : "";
    const link = item.url
      ? `<p><a href="${item.url}" target="_blank" rel="noreferrer">${ui.viewOnResearchmap}</a></p>`
      : "";
    card.innerHTML = `
      <h3>${item.title}</h3>
      ${meta}
      ${link}
    `;
    element.appendChild(card);
    observer.observe(card);
  });
};

const buildMarketableSummary = ({ affiliation, intro, focus, interests }) => {
  const focusParts = interests.slice(0, 4);
  if (lang === "en") {
    const affiliationPart = affiliation ? `${affiliation}. ` : "";
    const interestPart = focusParts.length
      ? `Key themes include ${focusParts.join(", ")}. `
      : "";
    return `${affiliationPart}A researcher and practitioner connecting university English education, curriculum design, and global talent development. ${interestPart}${focus || intro}`;
  }

  const affiliationPart = affiliation ? `${affiliation}。` : "";
  const interestPart = focusParts.length
    ? `${focusParts.join("・")}を軸に、`
    : "";
  return `${affiliationPart}${interestPart}大学英語教育、カリキュラム設計、グローバル人材育成をつなぐ研究者・実践者。${focus || intro}`;
};

const getAreaSectionTitles = () =>
  lang === "en"
    ? ["Research Interests", "Research Areas"]
    : ["研究キーワード", "研究分野"];

const getHistorySectionTitles = () =>
  lang === "en" ? ["Research History", "Career"] : ["経歴", "研究経歴"];

const getBooksSectionTitles = () =>
  lang === "en"
    ? ["Books and Other Publications", "Books"]
    : ["Books and Other Publications", "書籍等出版物", "書籍"];

const getPresentationsSectionTitles = () =>
  lang === "en"
    ? ["Presentations", "Oral presentations"]
    : ["講演・口頭発表等", "Presentations"];

const getActivitiesSectionTitles = () =>
  lang === "en"
    ? ["Misc", "MISC", "Other Activities"]
    : ["MISC", "Misc", "その他の活動"];

const findItemBlocks = (root) => {
  const selectors = [
    ".rm-cv-list-item",
    ".rm-cv-item",
    "li.rm-cv-list-item",
    ".researchmap-record",
    "article",
    "li",
  ];

  for (const selector of selectors) {
    const nodes = Array.from(root.querySelectorAll(selector)).filter((node) => {
      const titleNode = node.querySelector(
        "a.rm-cv-list-title, .rm-cv-list-title, .rm-cv-item-title, .rm-cv-title"
      );
      return Boolean(titleNode);
    });
    if (nodes.length) return nodes;
  }

  return [];
};

const extractOutputEntries = (html, maxItems) => {
  const doc = parseDocument(html);
  const root = pickContentRoot(doc);
  const blocks = findItemBlocks(root);

  const items = blocks
    .map((block) => {
      const titleNode =
        block.querySelector("a.rm-cv-list-title") ||
        block.querySelector(".rm-cv-list-title") ||
        block.querySelector(".rm-cv-item-title") ||
        block.querySelector(".rm-cv-title");
      const title = cleanText(titleNode?.textContent || "");
      if (isNoiseText(title)) return null;

      const linkNode = titleNode?.closest("a") || titleNode;
      const href = linkNode?.getAttribute?.("href") || "";
      const url = href
        ? href.startsWith("http")
          ? href
          : `https://researchmap.jp${href}`
        : buildProfileUrl();

      const metaCandidates = Array.from(
        block.querySelectorAll("time, .rm-cv-list-subtitle, .rm-cv-subtitle, .rm-cv-list-description, p")
      )
        .map((node) => cleanText(node.textContent || ""))
        .filter((text) => text && text !== title && !isNoiseText(text));

      const meta = metaCandidates[0] || "";
      return { title, meta, url };
    })
    .filter(Boolean);

  return items.slice(0, maxItems);
};

const extractOutputEntriesFromSection = (sectionHtml, maxItems, fallbackUrl) => {
  if (!sectionHtml) return [];

  const fragment = document.createElement("div");
  fragment.innerHTML = sectionHtml;
  const blocks = Array.from(fragment.querySelectorAll(".rm-cv-list-item, .rm-cv-item, li, article"));

  const items = blocks
    .map((block) => {
      const titleNode =
        block.querySelector("a.rm-cv-list-title") ||
        block.querySelector(".rm-cv-list-title") ||
        block.querySelector(".rm-cv-item-title") ||
        block.querySelector(".rm-cv-title") ||
        block.querySelector("a") ||
        block;

      const title = cleanText(titleNode?.textContent || "");
      if (!title || isNoiseText(title)) return null;

      const href = titleNode?.getAttribute?.("href") || "";
      const url = href
        ? href.startsWith("http")
          ? href
          : `https://researchmap.jp${href}`
        : fallbackUrl;

      const metaCandidates = Array.from(block.querySelectorAll("time, p, span, div"))
        .map((node) => cleanText(node.textContent || ""))
        .filter((text) => text && text !== title && !isNoiseText(text));

      return {
      title,
      meta: metaCandidates[0] || "",
      url,
    };
  })
    .filter(Boolean);

  return items.slice(0, maxItems);
};

const buildResearchAreaItems = (areaItems, interestItems) => {
  const values = [
    ...areaItems.map(
      (item) =>
        getLocalizedText(item.research_keyword) ||
        getLocalizedText(item.research_field) ||
        getLocalizedText(item.discipline)
    ),
    ...interestItems.map((item) => getLocalizedText(item.keyword)),
  ]
    .map(cleanText)
    .filter(Boolean);

  return [...new Set(values)].slice(0, 6);
};

const buildCareerItems = (items) =>
  items
    .map((item) => {
      const period = formatMonthRange(item.from_date, item.to_date);
      const affiliation = getLocalizedText(item.affiliation);
      const section = getLocalizedText(item.section);
      const job = getLocalizedText(item.job);
      const parts = lang === "en" ? [affiliation, section, job] : [affiliation, section, job];
      return [period, ...parts.filter(Boolean)].join(" ");
    })
    .filter(Boolean)
    .slice(0, 4);

const pickResearchmapUrl = (item, fallbackPath = "") => {
  const external = Array.isArray(item?.see_also)
    ? item.see_also.find((link) => link?.label === "url" || link?.is_downloadable)
    : null;
  return external?.["@id"] || item?.["@id"] || buildProfileUrl(fallbackPath);
};

const buildOutputEntry = (item, kind) => {
  const date = cleanText(item?.publication_date || item?.from_date || "");
  if (kind === "books") {
    return {
      title: getLocalizedText(item.book_title) || ui.untitled,
      meta: [date, getLocalizedText(item.publisher), formatAuthors(getLocalizedPeople(item.authors))]
        .filter(Boolean)
        .join(" / "),
      url: pickResearchmapUrl(item, "/books_etc"),
    };
  }

  if (kind === "presentations") {
    return {
      title: getLocalizedText(item.presentation_title) || ui.untitled,
      meta: [date, getLocalizedText(item.event)].filter(Boolean).join(" / "),
      url: pickResearchmapUrl(item, "/presentations"),
    };
  }

  return {
    title: getLocalizedText(item.paper_title) || ui.untitled,
    meta: [date, getLocalizedText(item.description)].filter(Boolean).join(" / "),
    url: pickResearchmapUrl(item, "/misc"),
  };
};

const applyProfileData = (profileData, areaItems, interestItems, experienceItems) => {
  const profileText = profileData?.profile || {};
  const affiliationEntry = Array.isArray(profileData?.affiliations)
    ? profileData.affiliations[0]
    : null;
  const affiliationLabel = buildAffiliationLabel(affiliationEntry);
  const introHtml = lang === "en" ? profileText.en : profileText.ja || profileText.en;
  const introDoc = parseDocument(`<div>${introHtml || ""}</div>`);
  const paragraphs = Array.from(introDoc.querySelectorAll("p"))
    .map((node) => cleanText(node.textContent || ""))
    .filter(Boolean);
  const researchAreaItems = buildResearchAreaItems(areaItems, interestItems);
  const interestValues = interestItems
    .map((item) => getLocalizedText(item.keyword))
    .filter(Boolean)
    .slice(0, 4);
  const sellableSummary = buildMarketableSummary({
    affiliation: affiliationLabel,
    intro: paragraphs[0] || "",
    focus: paragraphs[1] || paragraphs[0] || "",
    interests: researchAreaItems,
  });

  if (profileBody && sellableSummary) {
    profileBody.textContent = sellableSummary;
  }
  if (heroSummary) {
    heroSummary.textContent = fixedHeroMessage;
  }
  if (heroAffiliation && affiliationLabel) {
    heroAffiliation.textContent = affiliationLabel;
  }
  if (currentFocusBody) {
    currentFocusBody.textContent = paragraphs[1] || paragraphs[0] || currentFocusBody.textContent;
  }
  if (heroInterestLabel) {
    heroInterestLabel.textContent = lang === "en" ? "Research Interests" : "研究テーマ";
  }
  if (heroInterestValue && interestValues.length) {
    heroInterestValue.textContent = interestValues.join(" / ");
  }

  renderAutoList(researchAreasList, researchAreaItems, ui.areasEmpty);
  renderAutoList(careerHistoryList, buildCareerItems(experienceItems), ui.historyEmpty);
};

const loadResearchOutputs = async () => {
  try {
    const [booksData, presentationsData, activitiesData] = await Promise.all([
      fetchApiJson("/books_etc", { limit: siteConfig.maxResearchItems.books }),
      fetchApiJson("/presentations", { limit: siteConfig.maxResearchItems.presentations }),
      fetchApiJson("/misc", { limit: siteConfig.maxResearchItems.activities }),
    ]);

    renderOutputCards(
      booksList,
      (booksData.items || []).map((item) => buildOutputEntry(item, "books")),
      ui.booksEmpty
    );
    renderOutputCards(
      presentationsList,
      (presentationsData.items || []).map((item) => buildOutputEntry(item, "presentations")),
      ui.presentationsEmpty
    );
    renderOutputCards(
      activitiesList,
      (activitiesData.items || []).map((item) => buildOutputEntry(item, "activities")),
      ui.activitiesEmpty
    );
  } catch (error) {
    console.error(error);
    renderOutputCards(booksList, [], ui.booksEmpty);
    renderOutputCards(presentationsList, [], ui.presentationsEmpty);
    renderOutputCards(activitiesList, [], ui.activitiesEmpty);
  }
};

const loadProfile = async () => {
  try {
    const [profileData, areasData, interestsData, experienceData] = await Promise.all([
      fetchApiJson("", { limit: 1000 }),
      fetchApiJson("/research_areas", { limit: 1000 }),
      fetchApiJson("/research_interests", { limit: 1000 }),
      fetchApiJson("/research_experience", { limit: 1000 }),
    ]);
    applyProfileData(
      profileData,
      Array.isArray(areasData.items) ? areasData.items : [],
      Array.isArray(interestsData.items) ? interestsData.items : [],
      Array.isArray(experienceData.items) ? experienceData.items : []
    );
  } catch (error) {
    console.error(error);
    renderAutoList(researchAreasList, [], ui.areasEmpty);
    renderAutoList(careerHistoryList, [], ui.historyEmpty);
  }
};

loadPapers();
loadProfile();
loadResearchOutputs();

const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");

    const mailtoUrl = `mailto:${encodeURIComponent(siteConfig.contactEmail)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
  });
}
