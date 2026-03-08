package com.apptemplate.api.features.export;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.ByteArrayOutputStream;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ExportControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ExportService exportService;

    @BeforeEach
    void setup() {
        ExportController controller = new ExportController(exportService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void exportCsv_returnsFile() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        out.write("name,value\nTest,123".getBytes());
        ExportService.ExportResult result = new ExportService.ExportResult(out, "users.csv", "text/csv");

        when(exportService.exportUsers("csv")).thenReturn(result);

        mockMvc.perform(get("/api/export/users")
                        .param("format", "csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"users.csv\""));
    }

    @Test
    void exportExcel_returnsFile() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        out.write("excel-data".getBytes());
        ExportService.ExportResult result = new ExportService.ExportResult(out, "users.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        when(exportService.exportUsers("xlsx")).thenReturn(result);

        mockMvc.perform(get("/api/export/users")
                        .param("format", "xlsx"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"users.xlsx\""));
    }
}
