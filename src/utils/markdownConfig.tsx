/**
 * Markdown rendering configuration
 * 
 * Provides custom component mappings for markdown-to-jsx library.
 * Used by Post component to render custom components in Markdown content.
 */
import React from "react";
import { Loading, PdfViewer } from "@/components/markdownComponents";
import {
  ReactRuler,
  ScalableRuler,
  RulerGuideDemo,
  DesignToolRuler
} from "@/note_code/react-ruler";

export interface MarkdownComponentMapping {
  [key: string]: {
    component: React.ComponentType<any>;
  };
}

/**
 * Custom component mappings for Markdown
 * 
 * These are simple component mappings without any processing logic.
 * For code blocks and other complex handlers, see Post component.
 */
export const markdownComponents: MarkdownComponentMapping = {
  Loading: { component: Loading },
  PdfViewer: { component: PdfViewer },
  ReactRuler: { component: ReactRuler },
  ScalableRuler: { component: ScalableRuler },
  RulerGuideDemo: { component: RulerGuideDemo },
  DesignToolRuler: { component: DesignToolRuler }
};
