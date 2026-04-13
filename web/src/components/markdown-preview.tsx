import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

function renderMarkdown(markdown: string) {
  const lines = markdown.split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    nodes.push(
      <ul key={`list-${nodes.length}`} className="ml-5 list-disc text-sm leading-7">
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList();

    if (trimmed.startsWith('### ')) {
      nodes.push(
        <h4 key={`h4-${index}`} className="font-medium">
          {trimmed.slice(4)}
        </h4>,
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      nodes.push(
        <h3 key={`h3-${index}`} className="font-serif text-xl">
          {trimmed.slice(3)}
        </h3>,
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      nodes.push(
        <h2 key={`h2-${index}`} className="font-serif text-2xl">
          {trimmed.slice(2)}
        </h2>,
      );
      return;
    }

    nodes.push(
      <p key={`p-${index}`} className="text-sm leading-7 text-muted-foreground">
        {trimmed}
      </p>,
    );
  });

  flushList();

  if (nodes.length === 0) {
    return <p className="text-sm text-muted-foreground">Your CV preview will appear here.</p>;
  }

  return <div className="flex flex-col gap-4">{nodes}</div>;
}

export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <Card className="h-full bg-background/70">
      <CardHeader>
        <CardTitle className="text-xl">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[480px] pr-2">{renderMarkdown(markdown)}</ScrollArea>
      </CardContent>
    </Card>
  );
}
