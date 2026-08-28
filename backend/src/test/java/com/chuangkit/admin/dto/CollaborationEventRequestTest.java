package com.chuangkit.admin.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;

class CollaborationEventRequestTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsUnknownEventType() {
        CollaborationEventRequest request = new CollaborationEventRequest();
        request.setType("delete-all");

        Set<ConstraintViolation<CollaborationEventRequest>> violations = validator.validate(request);

        assertTrue(violations.stream().anyMatch(violation -> violation.getMessage().contains("协作事件类型")));
    }

    @Test
    void acceptsDocumentUpdateEventType() {
        CollaborationEventRequest request = new CollaborationEventRequest();
        request.setType("document-update");

        assertTrue(validator.validate(request).isEmpty());
    }
}
