export function coverImage(hex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<defs><radialGradient id="g" cx="0.5" cy="0.42" r="0.62"><stop offset="0" stop-color="#ffffff" stop-opacity="0.4"/><stop offset="1" stop-color="${hex}" stop-opacity="0"/></radialGradient></defs>
<rect width="800" height="600" fill="${hex}"/>
<rect width="800" height="600" fill="url(#g)"/>
<g fill="none" stroke="#ffffff" stroke-opacity="0.28" transform="translate(400 252)"><circle r="70"/><circle r="118"/><circle r="172"/><circle r="232"/></g>
</svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
