package apptemplate.api.controllers;

import apptemplate.application.dto.user.UserDto;
import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.application.dto.audit.AuditLogDto;
import apptemplate.application.ports.services.CurrentUserService;
import apptemplate.application.ports.services.ExportService;
import apptemplate.application.ports.services.ExportService.ExportResult;
import apptemplate.application.usecases.audit.GetAuditLogsUseCase;
import apptemplate.application.usecases.department.GetDepartmentsUseCase;
import apptemplate.application.usecases.user.GetUsersUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ExportControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ExportService exportService;

    @Mock
    private GetUsersUseCase getUsersUseCase;

    @Mock
    private GetDepartmentsUseCase getDepartmentsUseCase;

    @Mock
    private GetAuditLogsUseCase getAuditLogsUseCase;

    @Mock
    private CurrentUserService currentUserService;

    @BeforeEach
    void setup() {
        ExportController controller = new ExportController(
                exportService,
                getUsersUseCase,
                getDepartmentsUseCase,
                getAuditLogsUseCase,
                currentUserService
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void exportUsers_xlsx_returnsFile() throws Exception {
        Page<UserDto> page = new PageImpl<>(List.of());
        when(getUsersUseCase.execute(any(), any(), any(), anyInt(), anyInt(), any(), any()))
                .thenReturn(page);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write("test".getBytes());
        ExportResult result = new ExportResult(baos,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "users.xlsx");
        when(exportService.exportToExcel(any(), any(), any(), any())).thenReturn(result);

        mockMvc.perform(get("/api/export/users")
                        .param("format", "xlsx"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"users.xlsx\""));
    }

    @Test
    void exportUsers_csv_returnsFile() throws Exception {
        Page<UserDto> page = new PageImpl<>(List.of());
        when(getUsersUseCase.execute(any(), any(), any(), anyInt(), anyInt(), any(), any()))
                .thenReturn(page);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write("test".getBytes());
        ExportResult result = new ExportResult(baos, "text/csv", "users.csv");
        when(exportService.exportToCsv(any(), any(), any())).thenReturn(result);

        mockMvc.perform(get("/api/export/users")
                        .param("format", "csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"users.csv\""));
    }

    @Test
    void exportDepartments_returnsFile() throws Exception {
        Page<DepartmentDto> page = new PageImpl<>(List.of());
        when(getDepartmentsUseCase.execute(any(), any(), anyInt(), anyInt(), any(), any()))
                .thenReturn(page);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write("test".getBytes());
        ExportResult result = new ExportResult(baos,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "departments.xlsx");
        when(exportService.exportToExcel(any(), any(), any(), any())).thenReturn(result);

        mockMvc.perform(get("/api/export/departments"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"departments.xlsx\""));
    }

    @Test
    void exportAuditLogs_returnsFile() throws Exception {
        Page<AuditLogDto> page = new PageImpl<>(List.of());
        when(getAuditLogsUseCase.execute(
                any(), any(), any(), any(), any(), any(), any(),
                anyInt(), anyInt(), any(), any()
        )).thenReturn(page);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write("test".getBytes());
        ExportResult result = new ExportResult(baos,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "audit_logs.xlsx");
        when(exportService.exportToExcel(any(), any(), any(), any())).thenReturn(result);

        mockMvc.perform(get("/api/export/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"audit_logs.xlsx\""));
    }
}
