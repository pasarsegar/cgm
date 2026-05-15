"use client";

import { BuilderBlock } from "./types";
import parse from "html-react-parser";
import Link from "next/link";

export default function BuilderRendererLite({ content }: { content: string }) {
  let blocks: BuilderBlock[] = [];

  try {
    if (content && content.trim().startsWith("[")) {
      blocks = JSON.parse(content);
    }
  } catch {
    return null;
  }

  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="builder-content">
      {blocks.map((block) => (
        <div key={block.id} className="builder-block">
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: BuilderBlock): React.ReactNode {
  switch (block.type) {
    case "container": {
      const style = {
        display: "flex",
        flexDirection: block.content.direction === "column" ? "column" : "row",
        justifyContent:
          block.content.justify === "start"
            ? "flex-start"
            : block.content.justify === "center"
              ? "center"
              : block.content.justify === "end"
                ? "flex-end"
                : block.content.justify === "between"
                  ? "space-between"
                  : block.content.justify === "around"
                    ? "space-around"
                    : "flex-start",
        alignItems:
          block.content.align === "start"
            ? "flex-start"
            : block.content.align === "center"
              ? "center"
              : block.content.align === "end"
                ? "flex-end"
                : block.content.align === "stretch"
                  ? "stretch"
                  : "flex-start",
        gap: `${block.content.gap || 4}px`,
        padding: `${block.content.padding || 4}px`,
        backgroundColor: block.content.backgroundColor || "transparent",
      } as React.CSSProperties;

      const children: BuilderBlock[] = block.content.children || [];

      return (
        <div style={style} className="container-block">
          {children.map((child) => (
            <div key={child.id} className="container-child">
              {renderBlock(child)}
            </div>
          ))}
        </div>
      );
    }

    case "text": {
      if (block.content.noContainer) return <>{parse(block.content.html || "")}</>;
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="prose max-w-none text-gray-700 dark:text-gray-300">
            {parse(block.content.html || "")}
          </div>
        </div>
      );
    }

    case "image":
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          {block.content.url ? (
            <img
              src={block.content.url}
              alt={block.content.alt || ""}
              className="max-w-full h-auto rounded-lg shadow-md mx-auto"
            />
          ) : null}
          {block.content.caption ? (
            <p className="text-sm text-gray-500 mt-2 italic">{block.content.caption}</p>
          ) : null}
        </div>
      );

    case "button":
      return (
        <div className={`container mx-auto px-4 py-4 text-${block.content.alignment || "left"}`}>
          <Link
            href={block.content.url || "#"}
            className="inline-block bg-primary text-white px-6 py-3 rounded font-bold uppercase tracking-wider hover:opacity-90 transition-all"
          >
            {block.content.text}
          </Link>
        </div>
      );

    case "columns": {
      const columns: BuilderBlock[][] = block.content.columns || [[], [], [], []];
      return (
        <div className="container mx-auto px-4 py-8">
          <div
            className={`grid gap-8 ${
              block.content.type === "4-col"
                ? "md:grid-cols-4"
                : block.content.type === "3-col"
                  ? "md:grid-cols-3"
                  : block.content.type === "2-col-left-small"
                    ? "md:grid-cols-[1fr_2fr]"
                    : block.content.type === "2-col-right-small"
                      ? "md:grid-cols-[2fr_1fr]"
                      : "md:grid-cols-2"
            }`}
          >
            {columns.map((columnBlocks, index) => {
              if (block.content.type === "2-col" && index > 1) return null;
              if (block.content.type === "3-col" && index > 2) return null;
              if (
                (block.content.type === "2-col-left-small" ||
                  block.content.type === "2-col-right-small") &&
                index > 1
              ) {
                return null;
              }

              return (
                <div key={index} className="flex flex-col gap-4">
                  {columnBlocks && columnBlocks.length > 0 ? (
                    columnBlocks.map((subBlock) => <div key={subBlock.id}>{renderBlock(subBlock)}</div>)
                  ) : (
                    <div className="min-h-[50px]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
