import React from 'react';
import './brand.css';

/** Displays the exact supplied artwork using an SVG viewport; no font recreation. */
export default function BrandLogo({ dark = false, className = '' }) {
  return <svg className={`alt-brand-logo ${dark ? 'alt-brand-logo--dark' : ''} ${className}`} viewBox={dark ? '77 633 261 101' : '90 116 367 140'} role="img" aria-label="ALT"><image href={`${import.meta.env.BASE_URL}brand/alt-brand-board.png`} width="830" height="830"/></svg>;
}
