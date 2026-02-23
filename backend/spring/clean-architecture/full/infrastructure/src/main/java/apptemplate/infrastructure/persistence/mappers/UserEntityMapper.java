package apptemplate.infrastructure.persistence.mappers;

import apptemplate.domain.entities.User;
import apptemplate.infrastructure.persistence.entities.UserJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface UserEntityMapper {

    @Mapping(target = "department", ignore = true)
    @Mapping(source = "active", target = "isActive")
    @Mapping(target = "firstName", expression = "java(domain.getName() != null ? domain.getName().split(\" \")[0] : null)")
    @Mapping(target = "lastName", expression = "java(domain.getName() != null && domain.getName().contains(\" \") ? domain.getName().substring(domain.getName().indexOf(\" \") + 1) : null)")
    UserJpaEntity toJpaEntity(User domain);

    @Mapping(target = "name", expression = "java(combineName(jpaEntity.getFirstName(), jpaEntity.getLastName()))")
    @Mapping(target = "departmentName", expression = "java(jpaEntity.getDepartment() != null ? jpaEntity.getDepartment().getName() : null)")
    @Mapping(target = "passwordResetTokenExpiry", source = "passwordResetTokenExpiresAt")
    User toDomain(UserJpaEntity jpaEntity);

    @Mapping(target = "department", ignore = true)
    @Mapping(target = "firstName", expression = "java(domain.getName() != null ? domain.getName().split(\" \")[0] : null)")
    @Mapping(target = "lastName", expression = "java(domain.getName() != null && domain.getName().contains(\" \") ? domain.getName().substring(domain.getName().indexOf(\" \") + 1) : null)")
    void updateJpaEntity(User domain, @MappingTarget UserJpaEntity jpaEntity);

    @Named("combineName")
    default String combineName(String firstName, String lastName) {
        if (firstName == null && lastName == null) return null;
        if (firstName == null) return lastName;
        if (lastName == null) return firstName;
        return (firstName + " " + lastName).trim();
    }
}
