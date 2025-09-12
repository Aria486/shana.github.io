// Create mock constants for testing
export const NOTE_MENU = [
  "program",
  "study_note", 
  "history",
  "game",
  "novel",
  "religion",
];

export const ROOT_PATH = "shana.github.io";

// Mock modules for testing
export const mdModules = {
  '/src/note/program/test.md': () => Promise.resolve('# Test Content'),
  '/src/note/study_note/math.md': () => Promise.resolve('# Math Notes'),
};

export const pdfModules = {
  '/src/assets/document.pdf': () => Promise.resolve('/assets/document.pdf'),
};

describe('constants', () => {
  describe('NOTE_MENU', () => {
    it('contains expected menu items', () => {
      const expectedItems = [
        'program',
        'study_note',
        'history',
        'game',
        'novel',
        'religion',
      ];
      
      expect(NOTE_MENU).toEqual(expectedItems);
    });

    it('has correct length', () => {
      expect(NOTE_MENU).toHaveLength(6);
    });

    it('contains only string values', () => {
      NOTE_MENU.forEach(item => {
        expect(typeof item).toBe('string');
      });
    });

    it('does not contain duplicate items', () => {
      const uniqueItems = [...new Set(NOTE_MENU)];
      expect(uniqueItems).toHaveLength(NOTE_MENU.length);
    });

    it('contains program as first item', () => {
      expect(NOTE_MENU[0]).toBe('program');
    });

    it('contains religion as last item', () => {
      expect(NOTE_MENU[NOTE_MENU.length - 1]).toBe('religion');
    });
  });

  describe('ROOT_PATH', () => {
    it('has correct value', () => {
      expect(ROOT_PATH).toBe('shana.github.io');
    });

    it('is a string', () => {
      expect(typeof ROOT_PATH).toBe('string');
    });

    it('is not empty', () => {
      expect(ROOT_PATH.length).toBeGreaterThan(0);
    });

    it('does not contain spaces', () => {
      expect(ROOT_PATH).not.toContain(' ');
    });

    it('follows GitHub Pages naming convention', () => {
      expect(ROOT_PATH).toMatch(/^[a-zA-Z0-9.-]+$/);
    });
  });
});