import TableRoot from "./TableRoot";
import TableHead from "./TableHead";
import TableBody from "./TableBody";
import TableRow from "./TableRow";
import TableHeaderCell from "./TableHeaderCell";
import TableCell from "./TableCell";
import TableEmpty from "./TableEmpty";

export const Table = Object.assign(TableRoot, {
  Head: TableHead,
  Body: TableBody,
  Row: TableRow,
  HeaderCell: TableHeaderCell,
  Cell: TableCell,
  Empty: TableEmpty,
});