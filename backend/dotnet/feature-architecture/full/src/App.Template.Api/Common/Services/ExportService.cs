using System.Globalization;
using System.Reflection;
using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace App.Template.Api.Common.Services;

public interface IExportService
{
    Task<byte[]> ExportToCsvAsync<T>(IEnumerable<T> data);
    Task<byte[]> ExportToExcelAsync<T>(IEnumerable<T> data, string sheetName = "Data");
    Task<byte[]> ExportToPdfAsync<T>(IEnumerable<T> data, string title);
}

public class ExportService : IExportService
{
    static ExportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<byte[]> ExportToCsvAsync<T>(IEnumerable<T> data)
    {
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream);
        using var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture));
        
        await csv.WriteRecordsAsync(data);
        await writer.FlushAsync();
        
        return memoryStream.ToArray();
    }

    public Task<byte[]> ExportToExcelAsync<T>(IEnumerable<T> data, string sheetName = "Data")
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(sheetName);
        
        worksheet.Cell(1, 1).InsertTable(data);
        
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return Task.FromResult(stream.ToArray());
    }

    public Task<byte[]> ExportToPdfAsync<T>(IEnumerable<T> data, string title)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(50);
                page.Header().Text(title).SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);
                
                page.Content().PaddingVertical(10).Table(table =>
                {
                    var properties = typeof(T).GetProperties();
                    
                    table.ColumnsDefinition(columns =>
                    {
                        foreach (var _ in properties) columns.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        foreach (var prop in properties)
                        {
                            header.Cell().Element(CellStyle).Text(prop.Name);
                        }
                    });

                    foreach (var item in data)
                    {
                        foreach (var prop in properties)
                        {
                            var value = prop.GetValue(item)?.ToString() ?? "";
                            table.Cell().Element(CellStyle).Text(value);
                        }
                    }
                    
                    static IContainer CellStyle(IContainer container)
                    {
                        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                    }
                });
            });
        });

        return Task.FromResult(document.GeneratePdf());
    }
}
