using System.Globalization;
using System.Reflection;

using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace App.Template.Api.Features.Export;

public class ExportService : IExportService
{
    static ExportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public Task<ExportResult> ExportToCsvAsync<T>(IEnumerable<T> data, string fileName, CancellationToken cancellationToken = default)
    {
        var stream = new MemoryStream();
        using (var writer = new StreamWriter(stream, leaveOpen: true))
        using (var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true
        }))
        {
            csv.WriteRecords(data);
        }

        stream.Position = 0;
        var result = new ExportResult(
            stream,
            "text/csv",
            $"{fileName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv"
        );

        return Task.FromResult(result);
    }

    public Task<ExportResult> ExportToExcelAsync<T>(IEnumerable<T> data, string fileName, string sheetName = "Data", CancellationToken cancellationToken = default)
    {
        var stream = new MemoryStream();
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(sheetName);

        var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
        var dataList = data.ToList();

        // Write headers
        for (int i = 0; i < properties.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = FormatPropertyName(properties[i].Name);
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            cell.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
        }

        // Write data
        for (int row = 0; row < dataList.Count; row++)
        {
            for (int col = 0; col < properties.Length; col++)
            {
                var value = properties[col].GetValue(dataList[row]);
                var cell = worksheet.Cell(row + 2, col + 1);

                if (value is DateTime dt)
                {
                    cell.Value = dt;
                    cell.Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
                }
                else if (value is bool b)
                {
                    cell.Value = b ? "Yes" : "No";
                }
                else
                {
                    cell.Value = value?.ToString() ?? "";
                }
            }
        }

        worksheet.Columns().AdjustToContents();

        if (dataList.Count > 0)
        {
            var range = worksheet.Range(1, 1, dataList.Count + 1, properties.Length);
            range.SetAutoFilter();
        }

        workbook.SaveAs(stream);
        stream.Position = 0;

        var result = new ExportResult(
            stream,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"{fileName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx"
        );

        return Task.FromResult(result);
    }

    public Task<ExportResult> ExportToPdfAsync<T>(IEnumerable<T> data, string fileName, string reportTitle, PdfReportOptions? options = null, CancellationToken cancellationToken = default)
    {
        options ??= new PdfReportOptions();
        var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
        var dataList = data.ToList();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Element(c => ComposeHeader(c, reportTitle, options));
                page.Content().Element(c => ComposeContent(c, dataList, properties));
                page.Footer().Element(c => ComposeFooter(c, options));
            });
        });

        var stream = new MemoryStream();
        document.GeneratePdf(stream);
        stream.Position = 0;

        var result = new ExportResult(
            stream,
            "application/pdf",
            $"{fileName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.pdf"
        );

        return Task.FromResult(result);
    }

    private void ComposeHeader(IContainer container, string title, PdfReportOptions options)
    {
        container.Column(column =>
        {
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text(title).FontSize(18).Bold().FontColor(Colors.Blue.Darken2);

                    if (!string.IsNullOrEmpty(options.Subtitle))
                        col.Item().Text(options.Subtitle).FontSize(12).FontColor(Colors.Grey.Darken1);
                });

                row.ConstantItem(150).AlignRight().Column(col =>
                {
                    if (options.IncludeTimestamp)
                        col.Item().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC").FontSize(8);

                    if (!string.IsNullOrEmpty(options.GeneratedBy))
                        col.Item().Text($"By: {options.GeneratedBy}").FontSize(8);

                    if (options.FromDate.HasValue || options.ToDate.HasValue)
                    {
                        var dateRange = $"Period: {options.FromDate?.ToString("yyyy-MM-dd") ?? "Start"} - {options.ToDate?.ToString("yyyy-MM-dd") ?? "Now"}";
                        col.Item().Text(dateRange).FontSize(8);
                    }
                });
            });

            column.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
        });
    }

    private void ComposeContent<T>(IContainer container, List<T> data, PropertyInfo[] properties)
    {
        container.PaddingVertical(10).Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                foreach (var _ in properties)
                    columns.RelativeColumn();
            });

            table.Header(header =>
            {
                foreach (var prop in properties)
                {
                    header.Cell().Background(Colors.Blue.Lighten4)
                        .Padding(5)
                        .Text(FormatPropertyName(prop.Name))
                        .Bold()
                        .FontSize(8);
                }
            });

            foreach (var item in data)
            {
                foreach (var prop in properties)
                {
                    var value = prop.GetValue(item);
                    table.Cell()
                        .BorderBottom(1)
                        .BorderColor(Colors.Grey.Lighten2)
                        .Padding(4)
                        .Text(FormatValue(value))
                        .FontSize(8);
                }
            }
        });
    }

    private void ComposeFooter(IContainer container, PdfReportOptions options)
    {
        container.Row(row =>
        {
            row.RelativeItem().AlignLeft().Text("AppTemplate Report").FontSize(8).FontColor(Colors.Grey.Medium);

            if (options.IncludePageNumbers)
            {
                row.RelativeItem().AlignRight().Text(text =>
                {
                    text.Span("Page ").FontSize(8);
                    text.CurrentPageNumber().FontSize(8);
                    text.Span(" of ").FontSize(8);
                    text.TotalPages().FontSize(8);
                });
            }
        });
    }

    private static string FormatPropertyName(string name)
    {
        return string.Concat(name.Select((c, i) => i > 0 && char.IsUpper(c) ? " " + c : c.ToString()));
    }

    private static string FormatValue(object? value) => value switch
    {
        null => "-",
        DateTime dt => dt.ToString("yyyy-MM-dd HH:mm:ss"),
        bool b => b ? "Yes" : "No",
        _ => value.ToString() ?? "-"
    };
}
