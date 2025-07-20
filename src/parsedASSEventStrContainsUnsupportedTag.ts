export function parsedASSEventStrContainsUnsupportedTag(raw: string) {
  return (
    /\\p[1-9]/.test(raw) ||
    /\\clip/.test(raw) ||
    /\\move/.test(raw) ||
    /\\pos/.test(raw) ||
    /\\org/.test(raw) ||
    /\\fad/.test(raw) ||
    /\\fade/.test(raw) ||
    /\\t\(/.test(raw) ||
    /\\be/.test(raw) ||
    /\\blur/.test(raw) ||
    /\\shad[1-9]/.test(raw) ||
    /\\bord[1-9]/.test(raw) ||
    /\\frx/.test(raw) ||
    /\\fry/.test(raw) ||
    /\\frz/.test(raw) ||
    /\\fax/.test(raw) ||
    /\\fay/.test(raw) ||
    /\\xbord/.test(raw) ||
    /\\ybord/.test(raw) ||
    /\\xshad/.test(raw) ||
    /\\yshad/.test(raw)
  );
}
