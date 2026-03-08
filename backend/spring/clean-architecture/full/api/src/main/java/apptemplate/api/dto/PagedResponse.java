package apptemplate.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PagedResponse<T> {

    private boolean success;
    private String message;
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

    public static <T> PagedResponse<T> from(Page<T> page) {
        return PagedResponse.<T>builder()
                .success(true)
                .message("Items retrieved successfully")
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

    public static <T> PagedResponse<T> create(List<T> items, int page, int pageSize, long totalItems) {
        int totalPages = (int) Math.ceil(totalItems / (double) pageSize);
        return PagedResponse.<T>builder()
                .success(true)
                .message("Items retrieved successfully")
                .data(items)
                .pagination(PaginationMeta.builder()
                        .page(page)
                        .pageSize(pageSize)
                        .totalItems(totalItems)
                        .totalPages(totalPages)
                        .hasNext(page < totalPages)
                        .hasPrevious(page > 1)
                        .build())
                .build();
    }
}
