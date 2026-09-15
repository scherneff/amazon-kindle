/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-kindle-landing.js
  var import_kindle_landing_exports = {};
  __export(import_kindle_landing_exports, {
    default: () => import_kindle_landing_default
  });

  // tools/importer/parsers/hero-video.js
  function parse(element, { document: document2 }) {
    const region = element.closest(".apb-default-merchandised-search-2") || element;
    const eyebrowEl = region.querySelector(".text.color-gulfstream.font-size-medium, .text.bookerly");
    const headingImg = region.querySelector(".image img, img[title]");
    const introEl = region.querySelector(".text.color-gulfstream.font-size-small, .text.font-size-small.ember");
    const ctaLink = region.querySelector('a.link-container[href*="shelf/admin"], a[href*="shelf/admin"]');
    const videoSrc = region.querySelector('video source[src*=".mp4"], source[src*=".mp4"], a[href*=".mp4"]');
    const mp4Url = videoSrc ? videoSrc.getAttribute("src") || videoSrc.getAttribute("href") : null;
    if (!mp4Url && !headingImg && !eyebrowEl) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (eyebrowEl && eyebrowEl.textContent.trim()) {
      const eyebrow = document2.createElement("p");
      eyebrow.textContent = eyebrowEl.textContent.trim();
      textCell.push(eyebrow);
    }
    if (headingImg) {
      const heading = document2.createElement("h1");
      const headingText = (headingImg.getAttribute("title") || headingImg.getAttribute("alt") || "").trim();
      heading.textContent = headingText || "Your Company Bookshelf";
      textCell.push(heading);
    }
    if (introEl && introEl.textContent.trim()) {
      const intro = document2.createElement("p");
      intro.textContent = introEl.textContent.trim();
      textCell.push(intro);
    }
    if (ctaLink) {
      const cta = document2.createElement("a");
      cta.href = ctaLink.href;
      const ctaLabel = ctaLink.querySelector("h1, .heading") || ctaLink;
      cta.textContent = ctaLabel.textContent.trim() || "Create a Bookshelf";
      const strong = document2.createElement("strong");
      strong.append(cta);
      textCell.push(strong);
    }
    const mediaCell = [];
    if (mp4Url) {
      const mediaLink = document2.createElement("a");
      mediaLink.href = mp4Url;
      mediaLink.textContent = mp4Url;
      mediaCell.push(mediaLink);
    }
    const cells = [[textCell, mediaCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-steps.js
  function parse2(element, { document: document2 }) {
    let steps = [];
    const stepsImg = element.querySelector('img[alt*="Select Books"], img[alt*="How it Works"], img[alt*="How it works"]');
    if (stepsImg) {
      let alt = (stepsImg.getAttribute("alt") || "").trim();
      alt = alt.replace(/^how it works\s*:?\s*/i, "");
      alt = alt.replace(/\.\s*$/, "");
      steps = alt.split(/\s*,\s*|\s+and\s+/i).map((s) => s.trim()).filter(Boolean);
    }
    if (steps.length === 0) {
      const textNodes = element.querySelectorAll('.text, [class*="step"] .text, li');
      steps = Array.from(textNodes).map((n) => n.textContent.trim()).filter((t) => t && !/have questions/i.test(t));
    }
    if (steps.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const row = steps.map((label) => {
      const p = document2.createElement("p");
      p.textContent = label;
      return p;
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-steps", cells });
    const advisorLink = Array.from(element.querySelectorAll("a")).find((a) => /book advisor|contact a book/i.test(a.textContent));
    let advisorText = "";
    if (!advisorLink) {
      const m = element.textContent.match(/(Have Questions\?[^.]*Book Advisor\.?)/i);
      if (m) advisorText = m[1].trim();
    }
    if (advisorLink || advisorText) {
      const callout = document2.createElement("p");
      if (advisorLink) {
        const a = document2.createElement("a");
        a.href = advisorLink.href;
        a.textContent = advisorLink.textContent.trim() || "Contact a Book Advisor";
        callout.append(a);
      } else {
        callout.textContent = advisorText;
      }
      element.replaceWith(callout, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/columns-feature.js
  function parse3(element, { document: document2 }) {
    const containers = Array.from(element.querySelectorAll(".flex-align-items-center")).filter((c) => c.querySelector("h3, .heading") && c.querySelector("img"));
    const featureRows = containers.filter(
      (c) => !containers.some((other) => other !== c && other.contains(c))
    );
    const cells = [];
    featureRows.forEach((row) => {
      const heading = row.querySelector("h3, .heading");
      const paragraph = row.querySelector(".text.color-granite, .text.font-size-small");
      const img = row.querySelector("img");
      const ctaLink = row.querySelector('a.link-container[href*="shelf/admin"], a[href*="shelf/admin"]');
      if (!heading && !paragraph) return;
      const imageCell = [];
      if (img) imageCell.push(img.cloneNode(true));
      const textCell = [];
      if (heading && heading.textContent.trim()) {
        const h = document2.createElement("h2");
        h.textContent = heading.textContent.trim();
        textCell.push(h);
      }
      if (paragraph && paragraph.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = paragraph.textContent.trim();
        textCell.push(p);
      }
      if (ctaLink) {
        const cta = document2.createElement("a");
        cta.href = ctaLink.href;
        const label = ctaLink.querySelector(".text, h1, .heading") || ctaLink;
        cta.textContent = label.textContent.trim() || "Create a Bookshelf";
        const strong = document2.createElement("strong");
        strong.append(cta);
        textCell.push(strong);
      }
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-feature", cells });
    const consumed = [];
    featureRows.forEach((row) => {
      let node = row;
      while (node.parentElement && node.parentElement !== element) node = node.parentElement;
      if (node.parentElement === element && !consumed.includes(node)) consumed.push(node);
    });
    if (consumed.length) {
      element.insertBefore(block, consumed[0]);
      consumed.forEach((node) => node.remove());
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-testimonial.js
  function parse4(element, { document: document2 }) {
    const textDivs = Array.from(element.querySelectorAll(".text.color-gulfstream, .text.font-size-small")).filter((d) => /"|”|“/.test(d.textContent) || /^\s*[-–]/.test(d.textContent));
    const cells = [];
    textDivs.forEach((div) => {
      const segments = [];
      let current = "";
      div.childNodes.forEach((node) => {
        if (node.nodeName === "BR") {
          if (current.trim()) segments.push(current.trim());
          current = "";
        } else {
          current += node.textContent;
        }
      });
      if (current.trim()) segments.push(current.trim());
      if (segments.length === 0) return;
      const quoteText = segments[0];
      const attrText = segments.slice(1).find((s) => /^[-–]/.test(s)) || (segments.length > 1 ? segments[segments.length - 1] : "");
      const cell = [];
      const quote = document2.createElement("p");
      quote.textContent = quoteText;
      cell.push(quote);
      if (attrText) {
        const attr = document2.createElement("p");
        attr.append(document2.createElement("em"));
        attr.firstChild.textContent = attrText;
        cell.push(attr);
      }
      cells.push([cell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-testimonial", cells });
    const headingEl = Array.from(element.querySelectorAll("h1, h2, h3, h4, .heading")).find((h) => /customers are saying/i.test(h.textContent));
    let headingText = headingEl ? headingEl.textContent.trim() : "";
    if (!headingText) {
      const m = element.textContent.match(/(What our customers are saying\??)/i);
      if (m) headingText = m[1];
    }
    if (headingText) {
      const heading = document2.createElement("h2");
      heading.textContent = headingText;
      element.replaceWith(heading, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/accordion-faq.js
  function parse5(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll(".accordion"));
    if (items.length === 0 && element.classList.contains("accordion")) {
      items = [element];
    }
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".title");
      const contentEl = item.querySelector(".content");
      if (!titleEl && !contentEl) return;
      const questionText = titleEl ? titleEl.textContent.trim() : "";
      const question = document2.createElement("p");
      question.textContent = questionText;
      const answerCell = [];
      if (contentEl) {
        const paras = contentEl.querySelectorAll("p");
        if (paras.length) {
          paras.forEach((p) => answerCell.push(p.cloneNode(true)));
        } else if (contentEl.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = contentEl.textContent.trim();
          answerCell.push(p);
        }
      }
      if (answerCell.length === 0) answerCell.push("");
      cells.push([[question], answerCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/kindle-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#shortcut-menu",
        "#navbar-main",
        "#nav-top",
        "#skippedLink"
      ]);
      WebImporter.DOMUtils.remove(element, ["#navFooter"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#be",
        "#a-popover-root",
        "#amzn-nv-flyout-healthy-choice",
        "#nav-rufus-disc-txt",
        "#a-truncate-cut",
        "#sp-cc-wrapper",
        "#sp-cc",
        "#pldn-deep-link",
        "#add-to-cart-btn",
        "#amzn-nav-app-banner-container",
        ".mo-wp",
        ".a-image-container",
        ".amzn-box-inner",
        ".js-order-card",
        ".sparkle-container"
      ]);
      WebImporter.DOMUtils.remove(element, ["link", "script", "noscript", "style"]);
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (/fls-na\.amazon\.com\/1\/batch|\/gno\/sprites\/|\/uedata\b/.test(src)) {
          const p = img.closest("p, picture");
          (p || img).remove();
        }
      });
      element.querySelectorAll("p").forEach((p) => {
        const strong = p.children.length === 1 && p.firstElementChild.tagName === "STRONG" ? p.firstElementChild : null;
        if (!strong) return;
        if (!/frequently asked questions/i.test(strong.textContent)) return;
        const h2 = document.createElement("h2");
        h2.textContent = strong.textContent.trim();
        p.replaceWith(h2);
      });
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
        el.removeAttribute("data-aos");
        el.removeAttribute("data-aos-easing");
        el.removeAttribute("data-aos-duration");
        el.removeAttribute("data-aos-delay");
      });
    }
  }

  // tools/importer/transformers/kindle-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var STYLE_TO_BACKGROUND = {
    grey: "color-token-brand-band"
  };
  function backgroundFor(style) {
    if (!style) return null;
    return STYLE_TO_BACKGROUND[style] || null;
  }
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const bg = backgroundFor(section.style);
        if (i === 0 && !bg) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (bg) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const bg = backgroundFor(section.style);
        if (!bg) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { background: bg }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-kindle-landing.js
  var parsers = {
    "hero-video": parse,
    "columns-steps": parse2,
    "columns-feature": parse3,
    "cards-testimonial": parse4,
    "accordion-faq": parse5
  };
  var PAGE_TEMPLATE = {
    name: "kindle-landing",
    description: "Amazon 'Your Company Bookshelf' merchandised landing page: video hero, how-it-works steps, alternating feature highlights, customer testimonials, and an FAQ accordion.",
    urls: [
      "https://www.amazon.com/b?node=121179473011"
    ],
    blocks: [
      {
        name: "hero-video",
        instances: [
          ".apb-default-merchandised-search-2 .video",
          ".apb-default-merchandised-search-2 .has-max-width"
        ]
      },
      {
        name: "columns-steps",
        instances: [
          ".apb-default-merchandised-search-4 .desktop > .flex-container > .flex-container > .has-max-width > .flex-container:nth-of-type(1)"
        ]
      },
      {
        name: "columns-feature",
        instances: [
          ".apb-default-merchandised-search-4 .desktop > .flex-container > .flex-container > .has-max-width"
        ]
      },
      {
        name: "cards-testimonial",
        instances: [
          ".apb-default-merchandised-search-5 .desktop > .flex-container"
        ]
      },
      {
        name: "accordion-faq",
        instances: [
          ".apb-default-merchandised-search-6 .container.a20m.has-max-width"
        ]
      }
    ],
    sections: [
      {
        id: "rc-hero",
        name: "Hero",
        selector: [".apb-default-merchandised-search-2"],
        style: null,
        blocks: ["hero-video"],
        defaultContent: []
      },
      {
        id: "rc-how-it-works",
        name: "Advisor callout + How it works",
        selector: [".apb-default-merchandised-search-4 .has-max-width > .flex-container:nth-of-type(1)"],
        style: "grey",
        blocks: ["columns-steps"],
        defaultContent: [".apb-default-merchandised-search-4 .help-text-container"]
      },
      {
        id: "rc-features",
        name: "Feature highlights",
        selector: [".apb-default-merchandised-search-4 .has-max-width"],
        style: null,
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "rc-testimonials",
        name: "Customer testimonials",
        selector: [".apb-default-merchandised-search-5"],
        style: "light",
        blocks: ["cards-testimonial"],
        defaultContent: [".apb-default-merchandised-search-5 h2"]
      },
      {
        id: "rc-faq",
        name: "Frequently Asked Questions",
        selector: [".apb-default-merchandised-search-6"],
        style: "light",
        blocks: ["accordion-faq"],
        defaultContent: [".apb-default-merchandised-search-6 h2"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_kindle_landing_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_kindle_landing_exports);
})();
