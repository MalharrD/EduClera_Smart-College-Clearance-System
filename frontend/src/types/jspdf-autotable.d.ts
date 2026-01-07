declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface CellDef {
    content?: string | number;
    colSpan?: number;
    rowSpan?: number;
    styles?: Partial<Styles>;
  }

  interface ColumnInput {
    header?: string;
    dataKey?: string;
  }

  interface Styles {
    cellPadding?: number;
    fontSize?: number;
    font?: string;
    lineColor?: number | number[];
    lineWidth?: number;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    fillColor?: number | number[] | false;
    textColor?: number | number[];
    halign?: 'left' | 'center' | 'right' | 'justify';
    valign?: 'top' | 'middle' | 'bottom';
    cellWidth?: 'auto' | 'wrap' | number;
    minCellHeight?: number;
    minCellWidth?: number;
  }

  interface UserOptions {
    head?: (string | CellDef)[][];
    body?: (string | number | CellDef)[][];
    foot?: (string | CellDef)[][];
    columns?: ColumnInput[];
    startY?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    theme?: 'striped' | 'grid' | 'plain';
    styles?: Partial<Styles>;
    headStyles?: Partial<Styles>;
    bodyStyles?: Partial<Styles>;
    footStyles?: Partial<Styles>;
    alternateRowStyles?: Partial<Styles>;
    columnStyles?: { [key: string]: Partial<Styles> };
    didDrawCell?: (data: CellHookData) => void;
    didDrawPage?: (data: HookData) => void;
    didParseCell?: (data: CellHookData) => void;
    willDrawCell?: (data: CellHookData) => void;
    willDrawPage?: (data: HookData) => void;
  }

  interface CellHookData {
    cell: Cell;
    row: Row;
    column: Column;
    section: 'head' | 'body' | 'foot';
  }

  interface HookData {
    pageNumber: number;
    pageCount: number;
    settings: UserOptions;
    table: Table;
    cursor: { x: number; y: number };
  }

  interface Cell {
    raw: string | number | CellDef;
    content: string;
    styles: Styles;
    text: string[];
    section: 'head' | 'body' | 'foot';
    x: number;
    y: number;
    width: number;
    height: number;
    textPos: { x: number; y: number };
    colSpan: number;
    rowSpan: number;
  }

  interface Row {
    raw: (string | number | CellDef)[];
    index: number;
    section: 'head' | 'body' | 'foot';
    cells: { [key: string]: Cell };
    height: number;
    y: number;
  }

  interface Column {
    dataKey: string | number;
    index: number;
    width: number;
  }

  interface Table {
    head: Row[];
    body: Row[];
    foot: Row[];
    columns: Column[];
    settings: UserOptions;
    finalY: number;
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): jsPDF;
}
