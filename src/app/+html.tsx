import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Web-only root HTML. Runs in Node during static rendering, so no browser APIs here.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <title>Sla Bakken — het hoedenspel voor één telefoon</title>
        <meta
          name="description"
          content="Sla Bakken (hoedenspel) met teams, geheime woorden en drie rondes: omschrijven, uitbeelden en één woord. Speel met één telefoon."
        />
        <meta name="theme-color" content="#0B0E14" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `html, body, #root { background-color: #0B0E14; }` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
