package com.apptemplate.api.service;

import com.apptemplate.api.dto.AuditLogDto;
import com.apptemplate.api.exception.NotFoundException;
import com.apptemplate.api.model.AuditLog;
import com.apptemplate.api.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public Page<AuditLogDto> getAuditLogs(String search, String entityType, String action,
                                           String userId, LocalDateTime fromDate, LocalDateTime toDate,
                                           int page, int pageSize, String sortBy, String sortOrder) {
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : "createdAt";
        Sort sort = "asc".equalsIgnoreCase(sortOrder) ? Sort.by(field).ascending() : Sort.by(field).descending();
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, sort);

        Page<AuditLog> auditLogs = auditLogRepository.findWithFilters(
                search, entityType, action, userId, fromDate, toDate, pageRequest);

        return auditLogs.map(this::mapToDto);
    }

    public AuditLogDto getAuditLogById(Long id) {
        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("AuditLog", id));
        return mapToDto(auditLog);
    }

    private AuditLogDto mapToDto(AuditLog auditLog) {
        return AuditLogDto.builder()
                .id(auditLog.getId())
                .action(auditLog.getAction())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .userId(auditLog.getUserId())
                .userName(auditLog.getUserName())
                .details(auditLog.getDetails())
                .ipAddress(auditLog.getIpAddress())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}
