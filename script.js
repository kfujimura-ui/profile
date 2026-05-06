const siteConfig = {
  researchmapApi: "https://api.researchmap.jp/fujimurakeiji/published_papers",
  maxPapers: 6,
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
    loadingPapers: "論文データを読み込んでいます。",
    loadedPapers: (total, visible) =>
      `公開論文 ${total} 件を確認しました。最新 ${visible} 件を表示しています。`,
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
  },
  en: {
    authorsUnavailable: "Authors unavailable",
    dateUnavailable: "Date unavailable",
    journalUnavailable: "Journal not listed",
    untitled: "Untitled paper",
    peerReviewed: "Peer reviewed",
    publicRecord: "Public record",
    viewOnResearchmap: "View on researchmap",
    loadingPapers: "Loading publication data.",
    loadedPapers: (total, visible) =>
      `${total} public papers found. Showing the latest ${visible}.`,
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
const researchStatus = document.getElementById("research-status");
const paperCount = document.querySelector("[data-count]");

const formatAuthors = (authors) => {
  if (!Array.isArray(authors) || authors.length === 0) return ui.authorsUnavailable;
  return authors
    .slice(0, 4)
    .map((author) => author.name)
    .join(", ");
};

const formatDate = (value) => {
  if (!value) return ui.dateUnavailable;
  return value;
};

const makePaperCard = (paper) => {
  const article = document.createElement("article");
  const title = paper.paper_title?.en || paper.paper_title?.ja || ui.untitled;
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
  items.slice(0, siteConfig.maxPapers).forEach((paper) => {
    papersGrid.appendChild(makePaperCard(paper));
  });
};

const loadPapers = async () => {
  try {
    researchStatus.textContent = ui.loadingPapers;
    const response = await fetch(siteConfig.researchmapApi, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch papers: ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];

    paperCount.textContent = data.total_items || items.length;
    researchStatus.textContent = ui.loadedPapers(
      data.total_items || items.length,
      Math.min(items.length, siteConfig.maxPapers)
    );
    renderPapers(items);
  } catch (error) {
    researchStatus.textContent = ui.paperError;
    papersGrid.innerHTML = "";
    console.error(error);
  }
};

loadPapers();

const heroSummary = document.getElementById("hero-summary");
const heroAffiliation = document.getElementById("hero-affiliation");
const profileBody = document.getElementById("profile-body");
const currentFocusBody = document.getElementById("current-focus-body");
const researchAreasList = document.getElementById("research-areas-list");
const careerHistoryList = document.getElementById("career-history-list");
const fixedHeroMessage =
  "English Education, ESP, Active Learning, and Meeting Competency.";

const cleanText = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

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
    .filter(Boolean);
  return [...new Set(anchorTexts)];
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

const extractHistoryEntries = (sectionHtml) => {
  if (!sectionHtml) return [];
  const fragment = document.createElement("div");
  fragment.innerHTML = sectionHtml;
  const titles = Array.from(
    fragment.querySelectorAll("a.rm-cv-list-title, .rm-cv-list-title")
  ).map((node) => cleanText(node.textContent || ""));
  return [...new Set(titles)].slice(0, 6);
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

const loadProfile = async () => {
  const sourceUrl =
    lang === "en" ? siteConfig.researchmapProfileUrlEn : siteConfig.researchmapProfileUrlJa;

  try {
    let response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Direct profile fetch failed: ${response.status}`);
    }
    const html = await response.text();
    applyProfileHtml(html);
  } catch (_error) {
    try {
      const proxyUrl = `${siteConfig.profileProxyBase}${encodeURIComponent(sourceUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Proxy profile fetch failed: ${response.status}`);
      }
      const html = await response.text();
      applyProfileHtml(html);
    } catch (error) {
      console.error(error);
    }
  }
};

const applyProfileHtml = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const descriptionRoot = doc.querySelector(".rm-cv-description");
  const paragraphs = Array.from(descriptionRoot?.querySelectorAll("p") || [])
    .map((node) => cleanText(node.textContent || ""))
    .filter(Boolean);
  const affiliation = findAffiliation(doc);
  const interestFallback = extractResearchInterestFallback(html);
  const areaSectionHtml = extractSectionHtml(
    html,
    lang === "en" ? ["Research Areas"] : ["研究分野"]
  );
  const historySectionHtml = extractSectionHtml(
    html,
    lang === "en" ? ["Research History"] : ["経歴"]
  );
  const researchAreas = extractTextListFromSection(areaSectionHtml).slice(0, 6);
  const careerHistory = extractHistoryEntries(historySectionHtml);
  const sellableSummary = buildMarketableSummary({
    affiliation,
    intro: paragraphs[0] || "",
    focus: paragraphs[1] || interestFallback,
    interests: researchAreas,
  });

  if (sellableSummary) {
    profileBody.textContent = sellableSummary;
  }

  if (heroSummary) {
    heroSummary.textContent = fixedHeroMessage;
  }

  if (affiliation) {
    heroAffiliation.textContent = affiliation;
  }

  if (paragraphs[1]) {
    currentFocusBody.textContent = paragraphs[1];
  } else if (interestFallback) {
    currentFocusBody.textContent = interestFallback;
  }

  renderAutoList(researchAreasList, researchAreas, ui.areasEmpty);
  renderAutoList(careerHistoryList, careerHistory, ui.historyEmpty);
};

loadProfile();

const xTimelineRoot = document.getElementById("x-timeline");

const renderXFallback = () => {
  if (!xTimelineRoot) return;
  xTimelineRoot.innerHTML = `
    <div class="metric">
      <span class="metric-label">${ui.xFallback}</span>
      <p><a href="https://x.com/KeijiFujimura" target="_blank" rel="noreferrer">${ui.openX}</a></p>
    </div>
  `;
};

const mountXTimeline = () => {
  if (!xTimelineRoot) return;
  if (!window.twttr?.widgets?.createTimeline) {
    window.setTimeout(() => {
      if (window.twttr?.widgets?.createTimeline) {
        mountXTimeline();
      } else if (xTimelineRoot.children.length === 1) {
        renderXFallback();
      }
    }, 1800);
    return;
  }

  const link = xTimelineRoot.querySelector("a");
  if (link) {
    window.twttr.widgets.load(xTimelineRoot);
  } else {
    window.twttr.widgets
      .createTimeline(
        {
          sourceType: "profile",
          screenName: "KeijiFujimura",
        },
        xTimelineRoot,
        {
          theme: "light",
          chrome: "noheader nofooter noborders transparent",
          height: 620,
          dnt: true,
        }
      )
      .catch(renderXFallback);
  }
};

window.addEventListener("load", mountXTimeline);

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
