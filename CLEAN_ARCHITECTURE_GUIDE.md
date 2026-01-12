# How to Add a Feature in Clean Architecture
*A strict, step-by-step guide for Spring Boot, NestJS, and .NET*

This guide explains how to implement a new feature (e.g., "Create Order") while strictly adhering to Clean Architecture principles. The goal is to keep your core business logic (**Domain**) independent of external tools (**Infrastructure/API**).

---

## The Golden Rules
1.  **Dependencies Point Inwards**: Infrastructure depends on Application. Application depends on Domain. **Domain depends on nothing.**
2.  **Domain First**: Always start by defining *what* the business object is (Entity) and *what* acts on it (Use Case).
3.  **No Frameworks in Domain**: Your Domain Entities should be plain objects (POJO/POCO). No Hibernate/JPA/Entity Framework annotations in the Domain layer.

---

## 1. Spring Boot Backend (`backend-spring`)

### Layer Structure
- **Domain**: `domain/src/main/java/apptemplate/domain`
- **Application**: `application/src/main/java/apptemplate/application`
- **Infrastructure**: `infrastructure/src/main/java/apptemplate/infrastructure`
- **API**: `api/src/main/java/apptemplate/api`

### Step-by-Step Implementation

#### Step 1: The Domain (The "What")
Define your Entity and the interface for saving it.
1.  **Create Entity**: `domain/entities/Order.java`
    - Pure Java Class. Use Lombok (`@Getter`, `@Builder`) but NO `@Entity` or `@Table`.
2.  **Define Repository Interface**: `application/ports/repositories/OrderRepository.java`
    - Interface only. `void save(Order order);`, `Optional<Order> findById(Long id);`.

#### Step 2: The Application (The "How")
Define the specific business action.
1.  **Create Use Case Class**: `application/usecases/order/CreateOrderUseCase.java`
    - Annotate with `@Component` (or `@Service` if you prefer, but strictly strictly strictly business logic).
    - Inject `OrderRepository` via constructor.
    - **Logic**: Validate input, create `Order` entity, call `repository.save()`.

#### Step 3: The Infrastructure (The "Storage")
Implement the persistence mechanism.
1.  **Create JPA Entity**: `infrastructure/persistence/entities/OrderJpaEntity.java`
    - This gets the JPA annotations: `@Entity`, `@Table`, `@Id`.
2.  **Create Mapper**: `infrastructure/persistence/mappers/OrderEntityMapper.java`
    - Maps `Order` (Domain) <-> `OrderJpaEntity` (Infra).
3.  **Create JPA Repository**: `infrastructure/persistence/jpa/OrderJpaRepository.java`
    - Extends `JpaRepository<OrderJpaEntity, Long>`.
4.  **Implement Adapter**: `infrastructure/persistence/adapters/OrderRepositoryAdapter.java`
    - Implements `OrderRepository` (from Step 1).
    - Uses `OrderJpaRepository` and `OrderEntityMapper` to save/retrieve data.

#### Step 4: The API (The "Door")
Expose the feature to the world.
1.  **Create DTOs**: `application/dto/order/CreateOrderRequest.java`
    - Simple POJO for JSON input.
2.  **Create Controller**: `api/controller/OrderController.java`
    - `@RestController`.
    - Inject `CreateOrderUseCase`.
    - Endpoint calls `useCase.execute(request)`.

---

## 2. NestJS Backend (`backend-nestjs`)

### Layer Structure
Inside each module (e.g., `src/modules/orders`):
- **Domain**: `domain/entities`, `domain/ports`
- **Application**: `application/use-cases`, `application/dtos`
- **Infrastructure**: `infrastructure/persistence`, `infrastructure/mappers`
- **Presentation**: `interface/controllers`

### Step-by-Step Implementation

#### Step 1: The Domain
1.  **Create Entity**: `domain/entities/order.entity.ts`
    - Pure TypeScript class. `export class Order { ... }`.
2.  **Define Port**: `domain/ports/order.repository.ts`
    - Abstract class (acting as interface). `export abstract class OrderRepository { abstract save(order: Order): Promise<void>; }`.

#### Step 2: The Application
1.  **Create Use Case**: `application/use-cases/create-order.use-case.ts`
    - `@Injectable()`.
    - Constructor injects `OrderRepository` (use the abstract class name as the token).
    - Contains `execute(command: CreateOrderCommand): Promise<Order>`.

#### Step 3: The Infrastructure
1.  **Create Schema**: `infrastructure/persistence/entities/order.schema.ts` (if Mongoose) or TypeORM entity.
    - Database specific decorators (`@Schema`, `@Entity`).
2.  **Create Mapper**: `infrastructure/mappers/order.mapper.ts`
    - Static methods `toDomain(raw: any): Order` and `toPersistence(order: Order): any`.
3.  **Implement Repository**: `infrastructure/persistence/order.repository.impl.ts`
    - Implements `OrderRepository`.
    - Injects the database model/repo.
    - **Crucial**: Provide this implementation in the Module: `{ provide: OrderRepository, useClass: OrderRepositoryImpl }`.

#### Step 4: The Presentation
1.  **Create Controller**: `interface/controllers/order.controller.ts`
    - `@Controller('orders')`.
    - Call the Use Case.

---

## 3. .NET Backend (`backend-dotnet`)

### Layer Structure
- **Core**: `src/Core`
    - **Domain**: `App.Template.Domain/Entities`
    - **Application**: `App.Template.Application/UseCases`
- **Infrastructure**: `src/Infrastructure/App.Template.Infrastructure`
- **Presentation**: `src/Presentation/App.Template.Presentation`

### Step-by-Step Implementation

#### Step 1: The Domain (`App.Template.Domain`)
1.  **Create Entity**: `Entities/Order.cs`
    - clean C# class. `public class Order { ... }`.
2.  **Define Interface**: `Repositories/IOrderRepository.cs`
    - `public interface IOrderRepository { Task AddAsync(Order order); }`.

#### Step 2: The Application (`App.Template.Application`)
1.  **Create DTOs**: `DTOs/Order/CreateOrderDto.cs`.
2.  **Create Use Case (Command)**: `UseCases/Orders/CreateOrder/CreateOrderCommand.cs` (using MediatR pattern is common, or generic Service).
    - If Service: `OrderService.cs` implementing `IOrderService`.
    - Inject `IOrderRepository`.

#### Step 3: The Infrastructure (`App.Template.Infrastructure`)
1.  **Create DB Model**: `Persistence/Entities/OrderDbEntity.cs` (if separating from Domain, or configure EF Core directly on Domain entities if adhering to "Pragmatic" Clean Arch, but "Strict" separates them).
    - *Note: Strict guidelines suggest separation.*
2.  **Implement Repository**: `Persistence/Repositories/OrderRepository.cs`
    - Implements `IOrderRepository`.
    - Uses `ApplicationDbContext`.

#### Step 4: The Presentation (`App.Template.Presentation`)
1.  **Create Controller**: `Controllers/OrdersController.cs`
    - `[ApiController]`, `[Route("api/orders")]`.
    - Inject Use Case (or Mediator).
