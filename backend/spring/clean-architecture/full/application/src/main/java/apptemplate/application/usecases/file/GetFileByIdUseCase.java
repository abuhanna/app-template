package apptemplate.application.usecases.file;

import apptemplate.application.dto.file.UploadedFileDto;
import apptemplate.application.mappers.UploadedFileMapper;
import apptemplate.application.ports.repositories.UploadedFileRepository;
import apptemplate.domain.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GetFileByIdUseCase {

    private final UploadedFileRepository fileRepository;
    private final UploadedFileMapper fileMapper;

    @Transactional(readOnly = true)
    public UploadedFileDto execute(Long id) {
        return fileRepository.findById(id)
            .map(fileMapper::toDto)
            .orElseThrow(() -> new NotFoundException("File not found with id: " + id));
    }
}
