package apptemplate.application.mappers;

import apptemplate.application.dto.file.UploadedFileDto;
import apptemplate.domain.entities.UploadedFile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UploadedFileMapper {

    UploadedFileMapper INSTANCE = Mappers.getMapper(UploadedFileMapper.class);

    @Mapping(target = "downloadUrl", expression = "java(\"/api/files/\" + file.getId() + \"/download\")")
    UploadedFileDto toDto(UploadedFile file);
}
