using FluentValidation;

namespace AppTemplate.Application.Features.DepartmentManagement.Commands.UpdateDepartment;

public class UpdateDepartmentCommandValidator : AbstractValidator<UpdateDepartmentCommand>
{
    public UpdateDepartmentCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Department ID must be a positive number");

        RuleFor(x => x.Code)
            .MaximumLength(20).WithMessage("Department code cannot exceed 20 characters")
            .Matches("^[A-Z0-9_-]+$").WithMessage("Department code can only contain uppercase letters, numbers, underscores, and hyphens")
            .When(x => !string.IsNullOrEmpty(x.Code));

        RuleFor(x => x.Name)
            .MaximumLength(100).WithMessage("Department name cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
