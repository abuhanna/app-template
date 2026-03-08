package com.apptemplate.api.controller;

import com.apptemplate.api.dto.UploadedFileDto;
import com.apptemplate.api.model.UploadedFile;
import com.apptemplate.api.service.FileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FileControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FileService fileService;

    @BeforeEach
    void setup() {
        FileController controller = new FileController(fileService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void uploadFile_returnsUploadedFile() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", "test content".getBytes()
        );

        UploadedFileDto uploadedFileDto = UploadedFileDto.builder()
                .id(1L)
                .fileName("stored-test.pdf")
                .originalFileName("test.pdf")
                .contentType("application/pdf")
                .fileSize(12L)
                .build();

        when(fileService.storeFile(any(), any(), any(), anyBoolean())).thenReturn(uploadedFileDto);

        mockMvc.perform(multipart("/api/files")
                        .file(mockFile))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.originalFileName").value("test.pdf"));
    }

    @Test
    void downloadFile_returnsFileContent() throws Exception {
        byte[] content = "file content".getBytes();
        Resource resource = new ByteArrayResource(content);

        UploadedFile metadata = new UploadedFile();
        metadata.setId(1L);
        metadata.setOriginalFileName("test.pdf");
        metadata.setContentType("application/pdf");

        when(fileService.loadFileAsResource(1L)).thenReturn(resource);
        when(fileService.getFileMetadata(1L)).thenReturn(metadata);

        mockMvc.perform(get("/api/files/1/download"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"test.pdf\""));
    }
}
