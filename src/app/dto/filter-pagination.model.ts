export interface FilterPaginationDTO {
    pageSize: number,
    pageSizeOptions: number[],
    field: string,
    fieldsOptions: any[],
    ascending: boolean,
    ascendingOptions: any[],
    searchTerm: string
}
