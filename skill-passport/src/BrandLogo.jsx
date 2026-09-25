import React from 'react';
import './brand.css';

/** Displays the exact supplied artwork using an SVG viewport; no font recreation. */
export default function BrandLogo({ dark = false, className = '' }) {
  return <img className={`alt-brand-logo ${dark ? 'alt-brand-logo--dark' : ''} ${className}`} src="./alt-logo.svg" alt="ALT — Align Learn Thrive"/>;
}
