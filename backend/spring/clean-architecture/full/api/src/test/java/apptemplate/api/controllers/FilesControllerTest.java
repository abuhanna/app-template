package apptemplate.api.controllers;

import apptemplate.application.dto.file.UploadedFileDto;
import apptemplate.application.usecases.file.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.ByteArrayInputStream;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FilesControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UploadFileUseCase uploadFileUseCase;

    @Mock
    private GetFilesUseCase getFilesUseCase;

    @Mock
    private GetFileByIdUseCase getFileByIdUseCase;

    @Mock
    private DownloadFileUseCase downloadFileUseCase;

    @Mock
    private DeleteFileUseCase deleteFileUseCase;

    @BeforeEach
    void setup() {
        FilesController controller = new FilesController(
                uploadFileUseCase,
                getFilesUseCase,
                getFileByIdUseCase,
                downloadFileUseCase,
                deleteFileUseCase
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getFiles_returnsPagedResponse() throws Exception {
        UploadedFileDto file = new UploadedFileDto();
        file.setId(1L);
        file.setFileName("test.pdf");

        Page<UploadedFileDto> page = new PageImpl<>(List.of(file));
        when(getFilesUseCase.execute(any(), any(), any(), anyInt(), anyInt(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/files")
                        .param("page", "1")
                        .param("pageSize", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].fileName").value("test.pdf"));
    }

    @Test
    void getFileById_returnsFile() throws Exception {
        UploadedFileDto file = new UploadedFileDto();
        file.setId(1L);
        file.setFileName("test.pdf");

        when(getFileByIdUseCase.execute(1L)).thenReturn(file);

        mockMvc.perform(get("/api/files/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.fileName").value("test.pdf"));
    }

    @Test
    void uploadFile_returnsCreated() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "test.pdf", "application/pdf", "test content".getBytes()
        );

        UploadedFileDto uploaded = new UploadedFileDto();
        uploaded.setId(1L);
        uploaded.setFileName("test.pdf");

        when(uploadFileUseCase.execute(any(), any(), any(), anyBoolean())).thenReturn(uploaded);

        mockMvc.perform(multipart("/api/files")
                        .file(mockFile)
                        .param("description", "Test file")
                        .param("category", "documents")
                        .param("isPublic", "false"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void downloadFile_returnsFileContent() throws Exception {
        byte[] content = "file content".getBytes();
        DownloadFileUseCase.FileDownloadResult result = new DownloadFileUseCase.FileDownloadResult(
                new ByteArrayInputStream(content), "application/pdf", "test.pdf"
        );

        when(downloadFileUseCase.execute(1L)).thenReturn(result);

        mockMvc.perform(get("/api/files/1/download"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"test.pdf\""));
    }

    @Test
    void deleteFile_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/files/1"))
                .andExpect(status().isNoContent());

        verify(deleteFileUseCase).execute(1L);
    }
}
