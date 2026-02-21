import { useState, useEffect } from "react";
import DOMPurify from "dompurify";

interface WikiContent {
  html: string;
  title: string;
}

interface WikiError {
  message: string;
}

export function useWikiContent(itemName: string) {
  const [content, setContent] = useState<WikiContent | null>(null);
  const [error, setError] = useState<WikiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWikiContent = async () => {
      if (!itemName) return;

      setIsLoading(true);
      setError(null);

      try {
        let formattedName = itemName;

        // Only apply standard formatting if it's not a pre-formatted special case (like "Godlike_battleaxe")
        if (!itemName.includes("_")) {
          formattedName = itemName
            .split(" ")
            .map((word, index) =>
              index === 0
                ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                : word.toLowerCase()
            )
            .join("_");
        }

        const response = await fetch(`/api/wiki?page=${formattedName}`);

        if (!response.ok) {
          throw new Error("Failed to fetch wiki content");
        }

        const data = await response.json();

        if (data.error) {
          if (data.error.code === "missingtitle") {
            throw new Error("Item not found in wiki");
          }
          throw new Error(data.error.info || "Failed to fetch wiki content");
        }

        if (!data.parse) {
          throw new Error("Page not found");
        }

        // DOMPurify allowlist is intentionally restrictive to prevent XSS from wiki HTML
        const sanitizedHtml = DOMPurify.sanitize(data.parse.text["*"], {
          ALLOWED_TAGS: [
            "p",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "ul",
            "ol",
            "li",
            "table",
            "tr",
            "td",
            "th",
            "img",
            "a",
            "b",
            "i",
            "em",
            "strong",
          ],
          ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "rowspan"],
          FORBID_TAGS: ["style", "script"],
          FORBID_ATTR: ["onerror", "onload"],
        });

        const processedHtml = sanitizedHtml
          .replace(
            /<h2[^>]*>Contents(?:\[<a[^>]*>edit<\/a> \| <a[^>]*>edit source<\/a>\])?<\/h2>/g,
            ""
          )
          .replace(
            /<ul[^>]*>[\s\S]*?<li[^>]*class="toclevel[^"]*"[\s\S]*?<\/ul>/g,
            ""
          )
          .replace(/<li[^>]*class="toclevel[^"]*"[^>]*>[\s\S]*?<\/li>/g, "")
          .replace(/\[<a[^>]*>edit<\/a> \| <a[^>]*>edit source<\/a>\]/g, "")
          .replace(/>Combat</g, "><")
          .replace(
            /\/images\/thumb\/[^/]+\/[^/]+\/([^/]+)\.png\/[^\"]+/g,
            (match, filename) => {
              const localFilename = filename.toLowerCase().replace(/\s+/g, "_");
              return `/gameimages/${localFilename}.png`;
            }
          )
          .replace(/\/index.php\/File:([^"]+)\.png/g, (match, filename) => {
            const localFilename = filename.toLowerCase().replace(/\s+/g, "_");
            return `/gameimages/${localFilename}.png`;
          });

        setContent({
          html: processedHtml,
          title: data.parse.title,
        });
      } catch (err) {
        console.error("Wiki content error:", err);
        setError({
          message:
            err instanceof Error
              ? err.message
              : "An error occurred while fetching wiki content",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWikiContent();
  }, [itemName]);

  return { content, error, isLoading };
}
