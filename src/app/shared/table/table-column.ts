export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'boolean';
  filterOptions?: { label: string; value: any }[];
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: any) => string;
}
