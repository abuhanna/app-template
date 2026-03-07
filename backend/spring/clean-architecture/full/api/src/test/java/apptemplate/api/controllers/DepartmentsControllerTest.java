package apptemplate.api.controllers;

import apptemplate.application.dto.department.CreateDepartmentRequest;
import apptemplate.application.dto.department.DepartmentDto;
import apptemplate.application.dto.department.UpdateDepartmentRequest;
import apptemplate.application.usecases.department.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DepartmentsControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private GetDepartmentsUseCase getDepartmentsUseCase;

    @Mock
    private GetDepartmentByIdUseCase getDepartmentByIdUseCase;

    @Mock
    private CreateDepartmentUseCase createDepartmentUseCase;

    @Mock
    private UpdateDepartmentUseCase updateDepartmentUseCase;

    @Mock
    private DeleteDepartmentUseCase deleteDepartmentUseCase;

    @BeforeEach
    void setup() {
        DepartmentsController controller = new DepartmentsController(
                getDepartmentsUseCase,
                getDepartmentByIdUseCase,
                createDepartmentUseCase,
                updateDepartmentUseCase,
                deleteDepartmentUseCase
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getDepartments_returnsPagedResponse() throws Exception {
        DepartmentDto dept = new DepartmentDto();
        dept.setId(1L);
        dept.setName("IT Department");
        dept.setCode("IT");

        Page<DepartmentDto> page = new PageImpl<>(List.of(dept));
        when(getDepartmentsUseCase.execute(any(), any(), anyInt(), anyInt(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/departments")
                        .param("page", "1")
                        .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].name").value("IT Department"));
    }

    @Test
    void getDepartmentById_returnsDepartment() throws Exception {
        DepartmentDto dept = new DepartmentDto();
        dept.setId(1L);
        dept.setName("IT Department");
        dept.setCode("IT");

        when(getDepartmentByIdUseCase.execute(1L)).thenReturn(dept);

        mockMvc.perform(get("/api/departments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.code").value("IT"));
    }

    @Test
    void createDepartment_returnsCreated() throws Exception {
        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setName("HR Department");
        request.setCode("HR");

        DepartmentDto created = new DepartmentDto();
        created.setId(2L);
        created.setName("HR Department");
        created.setCode("HR");

        when(createDepartmentUseCase.execute(any())).thenReturn(created);

        mockMvc.perform(post("/api/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("HR Department"));
    }

    @Test
    void updateDepartment_returnsOk() throws Exception {
        UpdateDepartmentRequest request = new UpdateDepartmentRequest();
        request.setName("Updated Department");

        DepartmentDto updated = new DepartmentDto();
        updated.setId(1L);
        updated.setName("Updated Department");

        when(updateDepartmentUseCase.execute(eq(1L), any())).thenReturn(updated);

        mockMvc.perform(put("/api/departments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Department"));
    }

    @Test
    void deleteDepartment_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/departments/1"))
                .andExpect(status().isNoContent());

        verify(deleteDepartmentUseCase).execute(1L);
    }
}
