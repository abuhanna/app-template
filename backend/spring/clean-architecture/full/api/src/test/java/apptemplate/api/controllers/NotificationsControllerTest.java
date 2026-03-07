package apptemplate.api.controllers;

import apptemplate.application.dto.notification.NotificationDto;
import apptemplate.application.usecases.notification.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class NotificationsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private GetUserNotificationsUseCase getUserNotificationsUseCase;

    @Mock
    private MarkNotificationAsReadUseCase markNotificationAsReadUseCase;

    @Mock
    private MarkAllNotificationsAsReadUseCase markAllNotificationsAsReadUseCase;

    @BeforeEach
    void setup() {
        NotificationsController controller = new NotificationsController(
                getUserNotificationsUseCase,
                markNotificationAsReadUseCase,
                markAllNotificationsAsReadUseCase
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    @Test
    void getNotifications_returnsPagedResponse() throws Exception {
        NotificationDto notification = new NotificationDto();
        notification.setId(1L);
        notification.setMessage("Test notification");

        Page<NotificationDto> page = new PageImpl<>(List.of(notification));
        when(getUserNotificationsUseCase.execute(any(), any(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].message").value("Test notification"));
    }

    @Test
    void getNotifications_unreadOnly_returnsFilteredResponse() throws Exception {
        Page<NotificationDto> page = new PageImpl<>(List.of());
        when(getUserNotificationsUseCase.execute(any(), any(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/notifications")
                        .param("unreadOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    void markAsRead_returnsNoContent() throws Exception {
        mockMvc.perform(put("/api/notifications/1/read"))
                .andExpect(status().isNoContent());

        verify(markNotificationAsReadUseCase).execute(1L);
    }

    @Test
    void markAllAsRead_returnsNoContent() throws Exception {
        mockMvc.perform(put("/api/notifications/read-all"))
                .andExpect(status().isNoContent());

        verify(markAllNotificationsAsReadUseCase).execute();
    }
}
