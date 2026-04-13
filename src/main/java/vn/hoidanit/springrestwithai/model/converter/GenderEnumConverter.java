package vn.hoidanit.springrestwithai.model.converter;

import java.util.Locale;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.hoidanit.springrestwithai.model.User;

@Converter(autoApply = false)
public class GenderEnumConverter implements AttributeConverter<User.GenderEnum, String> {

    @Override
    public String convertToDatabaseColumn(User.GenderEnum attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public User.GenderEnum convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        return User.GenderEnum.valueOf(dbData.trim().toUpperCase(Locale.ROOT));
    }
}
