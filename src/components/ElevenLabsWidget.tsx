'use client';

import React, { useEffect } from 'react';

// Tell TypeScript about the ElevenLabs custom web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { 'agent-id': string },
        HTMLElement
      >;
    }
  }
}

const AGENT_ID = 'agent_1301kymjnjbpevba1tncfhmd5b0m';

export default function ElevenLabsWidget() {
  useEffect(() => {
    // Dynamically load the ElevenLabs widget script once
    if (document.getElementById('elevenlabs-widget-script')) return;
    const script = document.createElement('script');
    script.id = 'elevenlabs-widget-script';
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      // cleanup not needed — script persists for SPA navigation
    };
  }, []);

  return (
    <elevenlabs-convai agent-id={AGENT_ID} />
  );
}
