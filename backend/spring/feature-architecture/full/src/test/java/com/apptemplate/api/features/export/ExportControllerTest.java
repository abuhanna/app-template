package com.apptemplate.api.features.export;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ExportControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ExportService exportService;

    @BeforeEach
    void setup() {
        ExportController controller = new ExportController(exportService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void exportCsv_returnsFile() throws Exception {
        List<Map<String, Object>> data = List.of(
                Map.of("name", "Test", "value", "123")
        );

        ByteArrayInputStream csvStream = new ByteArrayInputStream("name,value\nTest,123".getBytes());
        when(exportService.exportToCsv(any())).thenReturn(csvStream);

        mockMvc.perform(post("/api/export/csv")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(data)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=export.csv"));
    }

    @Test
    void exportExcel_returnsFile() throws Exception {
        List<Map<String, Object>> data = List.of(
                Map.of("name", "Test", "value", "123")
        );

        ByteArrayInputStream excelStream = new ByteArrayInputStream("excel-data".getBytes());
        when(exportService.exportToExcel(any())).thenReturn(excelStream);

        mockMvc.perform(post("/api/export/excel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(data)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=export.xlsx"));
    }
}
