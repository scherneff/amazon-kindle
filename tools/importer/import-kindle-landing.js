/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroVideoParser from './parsers/hero-video.js';
import columnsStepsParser from './parsers/columns-steps.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsTestimonialParser from './parsers/cards-testimonial.js';
import accordionFaqParser from './parsers/accordion-faq.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/kindle-cleanup.js';
import sectionsTransformer from './transformers/kindle-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-video': heroVideoParser,
  'columns-steps': columnsStepsParser,
  'columns-feature': columnsFeatureParser,
  'cards-testimonial': cardsTestimonialParser,
  'accordion-faq': accordionFaqParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'kindle-landing',
  description: "Amazon 'Your Company Bookshelf' merchandised landing page: video hero, how-it-works steps, alternating feature highlights, customer testimonials, and an FAQ accordion.",
  urls: [
    'https://www.amazon.com/b?node=121179473011',
  ],
  blocks: [
    {
      name: 'hero-video',
      instances: [
        '.apb-default-merchandised-search-2 .video',
        '.apb-default-merchandised-search-2 .has-max-width',
      ],
    },
    {
      name: 'columns-steps',
      instances: [
        '.apb-default-merchandised-search-4 .desktop > .flex-container > .flex-container > .has-max-width > .flex-container:nth-of-type(1)',
      ],
    },
    {
      name: 'columns-feature',
      instances: [
        '.apb-default-merchandised-search-4 .desktop > .flex-container > .flex-container > .has-max-width',
      ],
    },
    {
      name: 'cards-testimonial',
      instances: [
        '.apb-default-merchandised-search-5 .desktop > .flex-container',
      ],
    },
    {
      name: 'accordion-faq',
      instances: [
        '.apb-default-merchandised-search-6 .container.a20m.has-max-width',
      ],
    },
  ],
  sections: [
    {
      id: 'rc-hero', name: 'Hero',
      selector: ['.apb-default-merchandised-search-2'],
      style: null, blocks: ['hero-video'], defaultContent: [],
    },
    {
      id: 'rc-how-it-works', name: 'Advisor callout + How it works',
      selector: ['.apb-default-merchandised-search-4 .has-max-width > .flex-container:nth-of-type(1)'],
      style: 'grey', blocks: ['columns-steps'],
      defaultContent: ['.apb-default-merchandised-search-4 .help-text-container'],
    },
    {
      id: 'rc-features', name: 'Feature highlights',
      selector: ['.apb-default-merchandised-search-4 .has-max-width'],
      style: null, blocks: ['columns-feature'], defaultContent: [],
    },
    {
      id: 'rc-testimonials', name: 'Customer testimonials',
      selector: ['.apb-default-merchandised-search-5'],
      style: 'light', blocks: ['cards-testimonial'],
      defaultContent: ['.apb-default-merchandised-search-5 h2'],
    },
    {
      id: 'rc-faq', name: 'Frequently Asked Questions',
      selector: ['.apb-default-merchandised-search-6'],
      style: 'light', blocks: ['accordion-faq'],
      defaultContent: ['.apb-default-merchandised-search-6 h2'],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata (afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        // A block may list multiple fallback selectors; only take the first that matches per element.
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already replaced by an earlier parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index to avoid empty-path crash)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
