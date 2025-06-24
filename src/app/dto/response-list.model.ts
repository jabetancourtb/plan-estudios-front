export interface ResponseList<T> {
    recordCountPerPage: number,
    totalRecordCount: number,
    totalPages: number,
    content: T[]
}