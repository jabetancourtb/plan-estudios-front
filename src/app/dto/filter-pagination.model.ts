export class FilterPaginationDTO {
  currentPage: number = 1;
  pages: number[] = [];
  pageSize: number = 10;
  totalItems: number = 0;

  pageSizeOptions: number[] = [10, 25, 50, 100, 200];
  field: string  = '';
  fieldsOptions: any[] = [];
  ascending: boolean = true;
  ascendingOptions: any[] = [
    { value: true, label: 'Ascendente' },
    { value: false, label: 'Descendente' }
  ];
  searchTerm: string = '';

  constructor(init?: Partial<FilterPaginationDTO>) {
    Object.assign(this, init);
  }

}
