import React from "react";

export const Document = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="mock-pdf-document">{children}</div>
);

export const Page = ({ pageNumber }: { pageNumber: number }) => (
  <div data-testid="mock-pdf-page">Page {pageNumber}</div>
);

export const pdfjs = {
  GlobalWorkerOptions: {
    workerSrc: "",
  },
};
