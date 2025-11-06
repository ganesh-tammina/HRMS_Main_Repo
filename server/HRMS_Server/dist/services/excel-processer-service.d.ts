export interface ExcelProcessResult {
    success: boolean;
    message: string;
    sheetName?: string;
    rowCount?: number;
    data?: any[];
    error?: string;
    details?: string;
}
export declare class ExcelProcessorService {
    static extractData(file: Express.Multer.File): Promise<ExcelProcessResult>;
}
//# sourceMappingURL=excel-processer-service.d.ts.map