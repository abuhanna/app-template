package apptemplate.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {
        "apptemplate.api",
        "apptemplate.application",
        "apptemplate.infrastructure"
})
@EntityScan(basePackages = "apptemplate.infrastructure.persistence.entities")
@EnableJpaRepositories(basePackages = "apptemplate.infrastructure.persistence.jpa")
public class AppTemplateApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppTemplateApplication.class, args);
    }
}
