import React, { useState } from "react";
import classnames from "classnames";
import { Document, Page, pdfjs } from "react-pdf";
import { Card, Pagination, theme } from "antd";
import { useClsAddPrefix } from "hooks";
import { ICommonComponent } from "interface";
import "./style.scss";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

export interface IPdfViewer extends ICommonComponent {
  reactNode?: React.ReactNode;
  name: string;
}

const { useToken } = theme;
export const PdfViewer: React.FC<IPdfViewer> = (props) => {
  const { className, name } = props;
  const prefixCls = useClsAddPrefix("pdf-viewer");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
  };
  console.log(useToken());
  return (
    <Card
      title={name}
      bordered={false}
      className={classnames(prefixCls, className)}
    >
      <Document
        className={`${prefixCls}-document`}
        file={require(`assets/docs/pdf/${name}`)}
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
