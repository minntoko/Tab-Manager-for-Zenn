const tabs = await chrome.tabs.query({
  url: [
    "https://zenn.dev/*"
  ],
});

const collator = new Intl.Collator();

const template = document.getElementById("li_template");
const elements = new Set();
if(tabs.length === 0) {
  const element = template.content.firstElementChild.cloneNode(true);
  element.querySelector(".title").textContent = "Zennのサイトを開く";
  elements.add(element);
  element.querySelector(".link").addEventListener("click", () => {
    chrome.tabs.create({ url: "https://zenn.dev/" });
  });
  document.querySelector("ul").append(...elements);
} else {
  for (const tab of tabs) {
    const element = template.content.firstElementChild.cloneNode(true);
  
    const title = tab.title.split("-")[0].trim();
    const pathname = new URL(tab.url).pathname.slice(1).split("/")[0];
  
    element.querySelector(".title").textContent = title;
    element.querySelector(".pathname").textContent = pathname;
    element.querySelector(".link").addEventListener("click", async () => {
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
    });
  
    elements.add(element);
  }
  document.querySelector("ul").append(...elements);
  
  const button = document.querySelector("button");
  
  let tabsGrouped = false;
  
  button.addEventListener("click", async () => {
    const tabIds = tabs.map(({ id }) => id);
    
    if (tabsGrouped) {
      chrome.tabs.ungroup(tabIds);
      button.textContent = "グループ化";
      tabsGrouped = false;
    } else {
      const group = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(group, {
        title: "Zenn | コンテンツ一覧",
      collapsed: true,
      color: "blue",
    });
    button.textContent = "グループ化解除";
    tabsGrouped = true;
  }
});
}