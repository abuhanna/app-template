package apptemplate.infrastructure.persistence.mappers;

import apptemplate.domain.entities.UploadedFile;
import apptemplate.infrastructure.persistence.entities.UploadedFileJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UploadedFileEntityMapper {

    UploadedFileEntityMapper INSTANCE = Mappers.getMapper(UploadedFileEntityMapper.class);

    @Mapping(target = "isPublic", source = "public")
    UploadedFile toDomain(UploadedFileJpaEntity entity);

    @Mapping(target = "isPublic", source = "public")
    UploadedFileJpaEntity toEntity(UploadedFile domain);
}
