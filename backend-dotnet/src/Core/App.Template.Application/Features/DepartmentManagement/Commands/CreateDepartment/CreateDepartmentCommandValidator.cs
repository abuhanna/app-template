using FluentValidation;

namespace AppTemplate.Application.Features.DepartmentManagement.Commands.CreateDepartment;

public class CreateDepartmentCommandValidator : AbstractValidator<CreateDepartmentCommand>
{
    public CreateDepartmentCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Department code is required")
            .MaximumLength(20).WithMessage("Department code cannot exceed 20 characters")
            .Matches("^[A-Z0-9_-]+$").WithMessage("Department code can only contain uppercase letters, numbers, underscores, and hyphens");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Department name is required")
            .MaximumLength(100).WithMessage("Department name cannot exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
