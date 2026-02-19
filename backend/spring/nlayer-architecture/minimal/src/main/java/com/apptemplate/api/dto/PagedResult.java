package com.apptemplate.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedResult<T> {
    private List<T> items;
    private PaginationMeta pagination;

    public static <T> PagedResult<T> fromPage(Page<T> page) {
        PaginationMeta meta = new PaginationMeta(
                page.getNumber() + 1, // Spring pages are 0-indexed
                page.getSize(),
                (int) page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious()
        );
        return new PagedResult<>(page.getContent(), meta);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationMeta {
        private int page;
        private int pageSize;
        private int totalItems;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }
}
