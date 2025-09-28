import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import parse, { HTMLReactParserOptions } from "html-react-parser";

type RenderHtmlOptions = {
  removeScripts?: boolean;
  stripChrome?: boolean;
};

const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode.type === "script") {
      return null;
    }
    return undefined;
  },
};

export function renderDataHtml(filename: string, options: RenderHtmlOptions = {}): ReactNode {
  const filePath = path.join(process.cwd(), "data", filename);
  const rawHtml = fs.readFileSync(filePath, "utf8");

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const content = bodyMatch ? bodyMatch[1] : rawHtml;

  const sanitized = options.removeScripts === false ? content : content.replace(/<script[\s\S]*?<\/script>/gi, "");

  const linkMap: Record<string, string> = {
    Home: "/",
    Explore: "/explore",
    Trending: "/trending",
    Pricing: "/pricing",
    Features: "/features",
    "Browser Extension": "/extensions",
    "Mobile App": "/app",
    About: "/about",
    Blog: "/blog",
    Careers: "/careers",
    Contact: "/contact",
    "Help Center": "/support",
    "Privacy Policy": "/privacy",
    "Terms of Service": "/terms",
    "API Docs": "/api",
  };

  const htmlWithLinks = sanitized.replace(
    /<span class="([^"]*?)cursor-pointer([^"]*?)">([^<]+)<\/span>/g,
    (match, before, after, label) => {
      const trimmedLabel = label.trim();
      const href = linkMap[trimmedLabel];
      if (!href) {
        return match;
      }
      return `<a class="${before}cursor-pointer${after}" href="${href}">${trimmedLabel}</a>`;
    }
  );

  const withoutChrome = options.stripChrome === false
    ? htmlWithLinks
    : htmlWithLinks
        .replace(/<header[\s\S]*?<\/header>/i, "")
        .replace(/<footer[\s\S]*?<\/footer>/i, "");

  const withImports = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
    </style>
    ${withoutChrome}
  `;

  return parse(withImports, parserOptions);
}
