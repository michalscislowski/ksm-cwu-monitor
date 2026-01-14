'use client';

import { useState } from 'react';

const docs = [
  {
    id: '00-functional-specification',
    title: 'Specyfikacja Funkcjonalna',
    description: 'Cele systemu, wymagania, przypadki użycia, interfejs',
    file: '/docs/00-functional-specification.html',
  },
  {
    id: '01-data-contract',
    title: 'Kontrakt Danych',
    description: 'Definicje wskaźników SE, KW, SS oraz źródła danych',
    file: '/docs/01-data-contract.html',
  },
  {
    id: '02-calculation-guide',
    title: 'Przewodnik Obliczeń',
    description: 'Szczegółowe wzory i algorytmy obliczania efektywności',
    file: '/docs/02-calculation-guide.html',
  },
  {
    id: '03-dokumentacja-techniczna',
    title: 'Dokumentacja Techniczna',
    description: 'Architektura systemu, typy danych, implementacja',
    file: '/docs/03-dokumentacja-techniczna.html',
  },
  {
    id: '04-api-specification',
    title: 'Specyfikacja API',
    description: 'Endpointy REST, formaty danych, przykłady',
    file: '/docs/04-api-specification.html',
  },
  {
    id: '05-next-steps',
    title: 'Następne Kroki',
    description: 'Roadmapa rozwoju i planowane funkcjonalności',
    file: '/docs/05-next-steps.html',
  },
];

export default function DocsPage() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  if (selectedDoc) {
    const doc = docs.find((d) => d.id === selectedDoc);
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedDoc(null)}
          className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <span>←</span>
          <span>Powrót do listy dokumentów</span>
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-border-subtle overflow-hidden">
          <iframe
            src={doc?.file}
            className="w-full h-[calc(100vh-180px)] border-0"
            title={doc?.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dokumentacja</h1>
        <p className="text-foreground-muted mt-1">
          Pełna dokumentacja systemu CWU Monitor
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setSelectedDoc(doc.id)}
            className="text-left p-5 bg-surface-elevated rounded-xl border border-border-subtle hover:border-efficiency/50 hover:shadow-lg hover:shadow-efficiency/5 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-efficiency/20 to-info/20 flex items-center justify-center mb-3">
                <span className="text-lg">📄</span>
              </div>
              <span className="text-xs text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity">
                Otwórz →
              </span>
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-efficiency transition-colors">
              {doc.title}
            </h3>
            <p className="text-sm text-foreground-muted mt-1">
              {doc.description}
            </p>
          </button>
        ))}
      </div>

      <div className="p-4 bg-surface-elevated rounded-xl border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
            <span className="text-sm">💡</span>
          </div>
          <div>
            <p className="text-sm text-foreground">
              Dokumentacja jest również dostępna jako{' '}
              <a
                href="/docs/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-efficiency hover:underline"
              >
                osobna strona HTML
              </a>{' '}
              do wydruku lub udostępnienia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
