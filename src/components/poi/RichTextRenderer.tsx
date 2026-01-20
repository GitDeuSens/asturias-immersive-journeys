import React from 'react';
import { RichTextBlock } from '@/data/mockData';
import { Quote, Lightbulb } from 'lucide-react';

interface RichTextRendererProps {
  blocks: RichTextBlock[];
  lang: 'es' | 'en' | 'fr';
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ blocks, lang }) => {
  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={index} className="text-foreground/80 leading-relaxed">
                {block.text[lang] || block.text.es}
              </p>
            );

          case 'bullets':
            return (
              <ul key={index} className="space-y-2 ml-1">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground/80">
                    <span className="text-primary mt-1.5 text-xs">●</span>
                    <span>{item[lang] || item.es}</span>
                  </li>
                ))}
              </ul>
            );

          case 'quote':
            return (
              <blockquote
                key={index}
                className="border-l-4 border-primary/40 pl-4 py-2 bg-primary/5 rounded-r-lg"
              >
                <div className="flex items-start gap-2">
                  <Quote className="w-4 h-4 text-primary/60 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-foreground/90 italic">
                      {block.text[lang] || block.text.es}
                    </p>
                    {block.author && (
                      <cite className="text-sm text-muted-foreground mt-1 block not-italic">
                        — {block.author[lang] || block.author.es}
                      </cite>
                    )}
                  </div>
                </div>
              </blockquote>
            );

          case 'highlight':
            return (
              <div
                key={index}
                className="bg-accent/50 border border-accent rounded-lg p-4"
              >
                {block.title && (
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-foreground">
                      {block.title[lang] || block.title.es}
                    </h4>
                  </div>
                )}
                <p className="text-foreground/80 text-sm">
                  {block.text[lang] || block.text.es}
                </p>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default RichTextRenderer;
