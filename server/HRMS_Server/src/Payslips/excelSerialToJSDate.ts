export function excelSerialToJSDate(serial: any): string | null {
    if (!serial || isNaN(serial)) return null;

    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel Base
    const jsDate = new Date(excelEpoch.getTime() + serial * 86400000);
    return jsDate.toISOString().split("T")[0] ?? null;
}