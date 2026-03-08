package apptemplate.api.controllers;

import apptemplate.application.dto.audit.AuditLogDto;
import apptemplate.application.usecases.audit.GetAuditLogsUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuditLogsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private GetAuditLogsUseCase getAuditLogsUseCase;

    @BeforeEach
    void setup() {
        AuditLogsController controller = new AuditLogsController(getAuditLogsUseCase);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getAuditLogs_returnsPagedResponse() throws Exception {
        AuditLogDto log = new AuditLogDto();
        log.setId(1L);
        log.setEntityType("User");
        log.setAction("CREATED");
        log.setEntityId("1");

        Page<AuditLogDto> page = new PageImpl<>(List.of(log));
        when(getAuditLogsUseCase.execute(
                any(), any(), any(), any(), any(), any(), any(),
                anyInt(), anyInt(), any(), any()
        )).thenReturn(page);

        mockMvc.perform(get("/api/audit-logs")
                        .param("page", "1")
                        .param("pageSize", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].entityType").value("User"))
                .andExpect(jsonPath("$.data[0].action").value("CREATED"));
    }

    @Test
    void getAuditLogs_withDefaultPagination_returnsOk() throws Exception {
        Page<AuditLogDto> page = new PageImpl<>(List.of());
        when(getAuditLogsUseCase.execute(
                any(), any(), any(), any(), any(), any(), any(),
                anyInt(), anyInt(), any(), any()
        )).thenReturn(page);

        mockMvc.perform(get("/api/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pagination").exists());
    }
}
