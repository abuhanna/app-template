package apptemplate.application.mappers;

import apptemplate.application.dto.auth.UserInfoResponse;
import apptemplate.application.dto.user.UserDto;
import apptemplate.domain.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    @Mapping(target = "departmentName", ignore = true)
    UserDto toDto(User user);

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    @Mapping(target = "departmentName", ignore = true)
    UserInfoResponse toUserInfoResponse(User user);
}
