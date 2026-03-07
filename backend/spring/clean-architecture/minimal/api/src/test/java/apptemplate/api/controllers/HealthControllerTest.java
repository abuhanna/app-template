package apptemplate.api.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class HealthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DataSource dataSource;

    @BeforeEach
    void setup() {
        HealthController controller = new HealthController();
        ReflectionTestUtils.setField(controller, "dataSource", dataSource);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void health_returnsHealthy() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("healthy"))
                .andExpect(jsonPath("$.application").value("AppTemplate API"));
    }

    @Test
    void ready_whenDatabaseConnected_returnsReady() throws Exception {
        Connection mockConnection = mock(Connection.class);
        when(mockConnection.isValid(5)).thenReturn(true);
        when(dataSource.getConnection()).thenReturn(mockConnection);

        mockMvc.perform(get("/health/ready"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ready"))
                .andExpect(jsonPath("$.database").value("connected"));
    }

    @Test
    void ready_whenDatabaseDisconnected_returnsServiceUnavailable() throws Exception {
        when(dataSource.getConnection()).thenThrow(new java.sql.SQLException("Connection refused"));

        mockMvc.perform(get("/health/ready"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("not ready"))
                .andExpect(jsonPath("$.database").value("disconnected"));
    }

    @Test
    void live_returnsAlive() throws Exception {
        mockMvc.perform(get("/health/live"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("alive"));
    }
}
