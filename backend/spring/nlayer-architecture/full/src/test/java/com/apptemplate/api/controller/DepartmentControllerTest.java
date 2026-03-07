package com.apptemplate.api.controller;

import com.apptemplate.api.dto.DepartmentDto;
import com.apptemplate.api.service.DepartmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
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

        List<DepartmentDto> departments = Arrays.asList(dept);
        when(departmentService.getAllDepartments()).thenReturn(departments);

        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("IT Department"));
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
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.code").value("IT"));
    }

    @Test
    void getDepartmentById_whenNotExists_returnsNotFound() throws Exception {
        when(departmentService.getDepartmentById(999L)).thenReturn(null);

        mockMvc.perform(get("/api/departments/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createDepartment_returnsCreatedDepartment() throws Exception {
        DepartmentDto request = new DepartmentDto();
        request.setName("HR Department");
        request.setCode("HR");

        DepartmentDto created = new DepartmentDto();
        created.setId(2L);
        created.setName("HR Department");
        created.setCode("HR");

        when(departmentService.createDepartment(any())).thenReturn(created);

        mockMvc.perform(post("/api/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("HR Department"));
    }

    @Test
    void updateDepartment_returnsUpdatedDepartment() throws Exception {
        DepartmentDto request = new DepartmentDto();
        request.setName("Updated Department");

        DepartmentDto updated = new DepartmentDto();
        updated.setId(1L);
        updated.setName("Updated Department");

        when(departmentService.updateDepartment(eq(1L), any())).thenReturn(updated);

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

        verify(departmentService).deleteDepartment(1L);
    }
}
