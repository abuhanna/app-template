package apptemplate.application.mappers;

import org.mapstruct.Mapper;

/**
 * User mapper stub. In minimal variant, there is no users table.
 * User info is obtained directly from JWT claims.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {
    // No mappings needed in minimal variant -- user info comes from JWT claims
}
