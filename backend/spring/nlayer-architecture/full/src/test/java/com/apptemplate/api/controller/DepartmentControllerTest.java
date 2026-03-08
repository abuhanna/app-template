package com.apptemplate.api.controller;

import com.apptemplate.api.dto.CreateDepartmentRequest;
import com.apptemplate.api.dto.DepartmentDto;
import com.apptemplate.api.dto.UpdateDepartmentRequest;
import com.apptemplate.api.service.DepartmentService;
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
import static org.mockito.Mockito.doNothing;
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
        DepartmentDto dept = DepartmentDto.builder()
                .id(1L)
                .name("IT Department")
                .code("IT")
                .isActive(true)
                .build();

        Page<DepartmentDto> page = new PageImpl<>(List.of(dept));
        when(departmentService.getDepartments(any(), any(), anyInt(), anyInt(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].name").value("IT Department"))
                .andExpect(jsonPath("$.pagination").exists());
    }

    @Test
    void getDepartmentById_whenExists_returnsDepartment() throws Exception {
        DepartmentDto dept = DepartmentDto.builder()
                .id(1L)
                .name("IT Department")
                .code("IT")
                .isActive(true)
                .build();

        when(departmentService.getDepartmentById(1L)).thenReturn(dept);

        mockMvc.perform(get("/api/departments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.code").value("IT"));
    }

    @Test
    void createDepartment_returnsCreatedDepartment() throws Exception {
        CreateDepartmentRequest request = new CreateDepartmentRequest();
        request.setName("HR Department");
        request.setCode("HR");

        DepartmentDto created = DepartmentDto.builder()
                .id(2L)
                .name("HR Department")
                .code("HR")
                .isActive(true)
                .build();

        when(departmentService.createDepartment(any())).thenReturn(created);

        mockMvc.perform(post("/api/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(2))
                .andExpect(jsonPath("$.data.name").value("HR Department"));
    }

    @Test
    void updateDepartment_returnsUpdatedDepartment() throws Exception {
        UpdateDepartmentRequest request = new UpdateDepartmentRequest();
        request.setName("Updated Department");

        DepartmentDto updated = DepartmentDto.builder()
                .id(1L)
                .name("Updated Department")
                .code("IT")
                .isActive(true)
                .build();

        when(departmentService.updateDepartment(eq(1L), any())).thenReturn(updated);

        mockMvc.perform(put("/api/departments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Updated Department"));
    }

    @Test
    void deleteDepartment_returnsNoContent() throws Exception {
        doNothing().when(departmentService).deleteDepartment(1L);

        mockMvc.perform(delete("/api/departments/1"))
                .andExpect(status().isNoContent());

        verify(departmentService).deleteDepartment(1L);
    }
}
