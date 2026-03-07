package com.apptemplate.api.features.files;

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

import static org.mockito.ArgumentMatchers.any;
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

        UploadedFile uploadedFile = new UploadedFile();
        uploadedFile.setId(1L);
        uploadedFile.setFileName("test.pdf");
        uploadedFile.setContentType("application/pdf");
        uploadedFile.setFileSize(12L);

        when(fileService.storeFile(any())).thenReturn(uploadedFile);

        mockMvc.perform(multipart("/api/files/upload")
                        .file(mockFile))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.fileName").value("test.pdf"));
    }

    @Test
    void downloadFile_returnsFileContent() throws Exception {
        byte[] content = "file content".getBytes();
        Resource resource = new ByteArrayResource(content);

        UploadedFile metadata = new UploadedFile();
        metadata.setId(1L);
        metadata.setFileName("test.pdf");
        metadata.setContentType("application/pdf");

        when(fileService.loadFileAsResource(1L)).thenReturn(resource);
        when(fileService.getFileMetadata(1L)).thenReturn(metadata);

        mockMvc.perform(get("/api/files/download/1"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"test.pdf\""));
    }
}
