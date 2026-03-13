package apptemplate.infrastructure.persistence.converters;

import apptemplate.domain.enums.NotificationType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter for NotificationType enum to store as lowercase string in database.
 */
@Converter(autoApply = true)
public class NotificationTypeConverter implements AttributeConverter<NotificationType, String> {

    @Override
    public String convertToDatabaseColumn(NotificationType type) {
        if (type == null) return null;
        return type.getValue();
    }

    @Override
    public NotificationType convertToEntityAttribute(String value) {
        return NotificationType.fromValue(value);
    }
}
