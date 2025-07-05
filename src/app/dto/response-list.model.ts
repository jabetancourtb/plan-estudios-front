export interface ResponseListDTO<T> {
    recordCountPerPage: number,
    totalRecordCount: number,
    totalPages: number,
    content: T[]
}