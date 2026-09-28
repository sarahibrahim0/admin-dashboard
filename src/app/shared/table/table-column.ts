export interface TableCellContent {
  label?: string | number;
  chips?: string[];
  icon?: string;
  iconClass?: string;
  badge?: string;
  badgeClass?: string;
}

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'boolean' | 'number';
  filterOptions?: { label: string; value: any }[];
  placeholder?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  imageField?: boolean;
  format?: (value: any, row: any) => string | TableCellContent;
}

export interface TableAction {
  type: string;
  icon: string;
  title?: string;
  class?: string;
  visible?: (row: any) => boolean;
}