import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { Document, Page, pdfjs } from "react-pdf";
import { Card, Pagination } from "antd";
import { useClsAddPrefix } from "@/hooks";
import { ICommonComponent } from "@/interface";
import { ROOT_PATH } from "@/utils/constants";
import "./style.scss";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

export interface IPdfViewer extends ICommonComponent {
  reactNode?: React.ReactNode;
  name: string;
}

export const PdfViewer: React.FC<IPdfViewer> = (props) => {
  const { className, name } = props;
  const prefixCls = useClsAddPrefix("pdf-viewer");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState("");

  const onDocumentLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    import(/* @vite-ignore */ `/${ROOT_PATH}/src/assets/docs/pdf/${name}`).then((module) => {
      setPdfUrl(module.default);
    });
  }, [name]);

  return (
    <Card
      title={name}
      bordered={false}
      className={classnames(prefixCls, className)}
    >
      <Document
        className={`${prefixCls}-document`}
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <Pagination
        className={`${prefixCls}-pagination`}
        showQuickJumper
        defaultPageSize={1}
        total={numPages ?? 0}
        onChange={setPageNumber}
        size="small"
        locale={{ jump_to: "跳转到", page: "页" }}
      />
    </Card>
  );
};
