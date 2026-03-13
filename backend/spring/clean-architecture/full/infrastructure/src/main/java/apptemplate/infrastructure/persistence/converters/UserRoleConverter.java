package apptemplate.infrastructure.persistence.converters;

import apptemplate.domain.enums.UserRole;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for UserRole enum to store as lowercase string in database.
 */
@Converter(autoApply = true)
public class UserRoleConverter implements AttributeConverter<UserRole, String> {

    @Override
    public String convertToDatabaseColumn(UserRole role) {
        if (role == null) return null;
        return role.getValue();
    }

    @Override
    public UserRole convertToEntityAttribute(String value) {
        return UserRole.fromValue(value);
    }
}
