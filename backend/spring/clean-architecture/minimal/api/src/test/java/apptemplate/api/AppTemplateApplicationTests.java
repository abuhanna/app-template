package apptemplate.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.boot.test.mock.mockito.MockBean;
import apptemplate.infrastructure.seeding.DataSeeder;

@SpringBootTest
class AppTemplateApplicationTests {

    @MockBean
    private DataSeeder dataSeeder;

    @Test
    void contextLoads() {
    }

}
