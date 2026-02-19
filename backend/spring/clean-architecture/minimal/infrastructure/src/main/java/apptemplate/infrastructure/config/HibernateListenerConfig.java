package apptemplate.infrastructure.config;

import apptemplate.infrastructure.persistence.listeners.HibernateAuditListener;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventType;
import org.hibernate.internal.SessionFactoryImpl;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class HibernateListenerConfig {

    @PersistenceUnit
    private EntityManagerFactory entityManagerFactory;

    private final HibernateAuditListener hibernateAuditListener;

    @PostConstruct
    public void registerListeners() {
        log.info("Attempting to register HibernateAuditListener...");
        log.info("EntityManagerFactory type: {}", entityManagerFactory != null ? entityManagerFactory.getClass().getName() : "null");
        
        try {
            SessionFactoryImpl sessionFactory = entityManagerFactory.unwrap(SessionFactoryImpl.class);
            
            if (sessionFactory != null) {
                EventListenerRegistry registry = sessionFactory.getServiceRegistry().getService(EventListenerRegistry.class);
                
                registry.getEventListenerGroup(EventType.POST_INSERT).appendListener(hibernateAuditListener);
                registry.getEventListenerGroup(EventType.POST_UPDATE).appendListener(hibernateAuditListener);
                registry.getEventListenerGroup(EventType.POST_DELETE).appendListener(hibernateAuditListener);
                
                log.info("HibernateAuditListener registered successfully for POST_INSERT, POST_UPDATE, POST_DELETE events");
            } else {
                log.warn("Could not unwrap SessionFactoryImpl from EntityManagerFactory");
            }
        } catch (Exception e) {
            log.error("Failed to register Hibernate listeners", e);
        }
    }
}
