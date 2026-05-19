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
      const textStyle = {
        color: block.content.color || "inherit",
        fontSize: block.content.fontSize || "inherit",
        fontFamily: block.content.fontFamily || "inherit",
      };
      if (block.content.noContainer) return <div style={textStyle}>{parse(block.content.html || "")}</div>;
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="prose max-w-none" style={textStyle}>
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

    case "gallery": {
      const galleryImages = block.content.images || [];
      return (
        <div className="container mx-auto px-4 py-8">
          <div
            className={`grid gap-${block.content.gap || 4}`}
            style={{ gridTemplateColumns: `repeat(${block.content.columns || 3}, minmax(0, 1fr))` }}
          >
            {galleryImages.map((img: any, idx: number) => (
              <div key={idx} className="aspect-square overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={img.url}
                  alt={img.alt || ""}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "video": {
      const getVideoUrl = () => {
        const { url, type } = block.content;
        if (type === "youtube") {
          const id = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop();
          return `https://www.youtube.com/embed/${id}?autoplay=${block.content.autoPlay ? 1 : 0}&loop=${
            block.content.loop ? 1 : 0
          }&mute=${block.content.muted ? 1 : 0}`;
        }
        if (type === "vimeo") {
          const id = url.split("/").pop();
          return `https://player.vimeo.com/video/${id}?autoplay=${block.content.autoPlay ? 1 : 0}&loop=${
            block.content.loop ? 1 : 0
          }&muted=${block.content.muted ? 1 : 0}`;
        }
        return url;
      };

      return (
        <div className="container mx-auto px-4 py-8">
          <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black">
            {block.content.type === "custom" ? (
              <video
                src={block.content.url}
                controls
                autoPlay={block.content.autoPlay}
                loop={block.content.loop}
                muted={block.content.muted}
                className="w-full h-full"
              />
            ) : (
              <iframe
                src={getVideoUrl()}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      );
    }

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
