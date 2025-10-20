export const isUSZip = (v: string) => /^\d{5}(?:-\d{4})?$/.test(v.trim());
export const cleanUSZip = (v: string) => v.replace(/[^\d-]/g, "").slice(0, 10);