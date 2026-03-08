package com.apptemplate.api.service;

import com.apptemplate.api.dto.AuditLogDto;
import com.apptemplate.api.exception.NotFoundException;
import com.apptemplate.api.model.AuditLog;
import com.apptemplate.api.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, String entityId,
                    Long userId, String userName, String details, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setUserId(userId);
        auditLog.setUserName(userName);
        auditLog.setDetails(details);
        auditLog.setIpAddress(ipAddress);
        auditLogRepository.save(auditLog);
    }

    public Page<AuditLogDto> getAuditLogs(String search, String entityType, String action,
                                           Long userId, int page, int pageSize,
                                           String sortBy, String sortOrder) {
        Sort sort = buildSort(sortBy, sortOrder, "createdAt");
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Page<AuditLog> auditLogs = auditLogRepository.findAllWithFilters(
                search, entityType, action, userId, pageable);

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

    private Sort buildSort(String sortBy, String sortOrder, String defaultSortBy) {
        String field = (sortBy != null && !sortBy.isBlank()) ? sortBy : defaultSortBy;
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, field);
    }
}
