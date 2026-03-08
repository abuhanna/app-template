package com.apptemplate.api.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResult<T> {
    private List<T> data;
    private PaginationMeta pagination;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationMeta {
        private int page;
        private int pageSize;
        private long totalItems;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    public static <T> PagedResult<T> fromPage(Page<T> page) {
        return PagedResult.<T>builder()
                .data(page.getContent())
                .pagination(PaginationMeta.builder()
                        .page(page.getNumber() + 1)  // Convert to 1-based page number
                        .pageSize(page.getSize())
                        .totalItems(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .hasNext(page.hasNext())
                        .hasPrevious(page.hasPrevious())
                        .build())
                .build();
    }
}
