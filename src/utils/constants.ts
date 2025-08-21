export const NOTES = import.meta.glob("/src/note/**/*.md", {
  eager: false,
});

export const mdModules = import.meta.glob("/src/note/**/*.md", {
  as: "raw",
});

export const NOTE_MENU = [
  "program",
  "study_note",
  "history",
  "game",
  "novel",
  "religion",
];

export const ROOT_PATH = "shana.github.io";
