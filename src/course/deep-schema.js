// Each knowledge point gets its own reasoning chain, worked situation and test.
// These are original teaching notes, not excerpts from the linked lecture PDFs.
export const detail=(reasoning,example,pitfall,question,answer,tex='')=>({reasoning:reasoning.split('\n\n'),example:example.split('\n'),pitfall,question,answer,tex});
