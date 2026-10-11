// The explanations, examples, and questions are independently authored.
// Page numbers refer to the physical PDF page, not a footer slide number.
export const s = (title, pages, paragraphs, tex = '', note = '') => ({title, pages, paragraphs: paragraphs.split('\n\n'), tex, note});
export const ex = (title, question, steps, answer) => ({title, question, steps, answer});
export const mc = (question, options, answer, explain, section = 0) => ({type:'choice', question, options, answer, explain, section});
export const num = (question, answer, tolerance, explain, unit = '', section = 0) => ({type:'number', question, answer, tolerance, explain, unit, section});
export const reflect = (question, rubric, section = 0) => ({type:'reflection', question, rubric, section});
export const guide = (title, predict, steps, expected, why, params = {}) => ({title, predict, steps, expected, why, params});
export const r = String.raw;
