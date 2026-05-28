"use client";

import React from "react";

export default function CreditsPage() {
  return (
    <main className="main-wrapper">
      <h1 className="text-4xl font-bold mb-6 text-gradient">Credits</h1>

      {/* Steam ICAC – the competition that inspired the AI model */}
      <details className="glass-card mb-4 p-4">
        <summary className="cursor-pointer font-medium text-lg">Steam ICAC</summary>
        <p className="mt-2 text-sm">
          The <strong>Steam ICAC</strong> competition is the event that sparked the creation of our AI model. It brings together students, hobbyists, and researchers to develop innovative solutions for exoplanet habitability scoring. The competition is organized by the STEAM education community and encourages creative, interdisciplinary projects.
        </p>
      </details>

      {/* Our Steam ICAC Club – thank you to the organizers */}
      <details className="glass-card mb-4 p-4">
        <summary className="cursor-pointer font-medium text-lg">Our Steam ICAC Club</summary>
        <p className="mt-2 text-sm">
          We would like to thank the organizers of the Steam ICAC Club for informing us about this amazing event and providing the platform to showcase our work. Their dedication to fostering collaboration and learning has been invaluable to our team.
        </p>
      </details>

      {/* External websites – NASA and other resources */}
      <details className="glass-card mb-4 p-4">
        <summary className="cursor-pointer font-medium text-lg">External Resources</summary>
        <p className="mt-2 text-sm">
          The development of ELSA AI relied on publicly available data and media from several reputable sources:
        </p>
        <ul className="list-disc list-inside ml-4 mt-2 text-sm">
          <li>NASA – imagery, scientific data, and educational material.</li>
          <li>ESA/Hubble – high‑resolution nebula and galaxy videos.</li>
          <li>MixKit – royalty‑free space video clips used for the background.</li>
          <li>Coverr, Pixabay, and Videezy – additional stock footage and assets.</li>
        </ul>
      </details>
    </main>
  );
}
