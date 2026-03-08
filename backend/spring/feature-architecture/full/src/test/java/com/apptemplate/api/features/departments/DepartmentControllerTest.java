package com.apptemplate.api.features.departments;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DepartmentControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private DepartmentService departmentService;

    @BeforeEach
    void setup() {
        DepartmentController controller = new DepartmentController(departmentService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getAllDepartments_returnsDepartments() throws Exception {
        DepartmentDto dept = new DepartmentDto();
        dept.setId(1L);
        dept.setName("IT Department");
        dept.setCode("IT");

        Page<DepartmentDto> page = new PageImpl<>(List.of(dept), PageRequest.of(0, 10), 1);
        when(departmentService.getDepartments(isNull(), isNull(), eq(1), eq(10), isNull(), eq("desc")))
                .thenReturn(page);

        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.data[0].id").value(1))
                .andExpect(jsonPath("$.data.data[0].name").value("IT Department"));
    }

    @Test
    void getDepartmentById_whenExists_returnsDepartment() throws Exception {
        DepartmentDto dept = new DepartmentDto();
        dept.setId(1L);
        dept.setName("IT Department");
        dept.setCode("IT");

        when(departmentService.getDepartmentById(1L)).thenReturn(dept);

        mockMvc.perform(get("/api/departments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.code").value("IT"));
    }

    @Test
    void createDepartment_returnsCreatedDepartment() throws Exception {
        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setName("HR Department");
        request.setCode("HR");

        DepartmentDto created = new DepartmentDto();
        created.setId(2L);
        created.setName("HR Department");
        created.setCode("HR");

        when(departmentService.createDepartment(any(CreateDepartmentRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(2))
                .andExpect(jsonPath("$.data.name").value("HR Department"));
    }

    @Test
    void updateDepartment_returnsUpdatedDepartment() throws Exception {
        UpdateDepartmentRequest request = new UpdateDepartmentRequest();
        request.setName("Updated Department");

        DepartmentDto updated = new DepartmentDto();
        updated.setId(1L);
        updated.setName("Updated Department");

        when(departmentService.updateDepartment(eq(1L), any(UpdateDepartmentRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/departments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Department"));
    }

    @Test
    void deleteDepartment_returnsNoContent() throws Exception {
        doNothing().when(departmentService).deleteDepartment(1L);

        mockMvc.perform(delete("/api/departments/1"))
                .andExpect(status().isNoContent());
    }
}
