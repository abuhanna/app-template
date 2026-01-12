using FluentValidation;

namespace AppTemplate.Application.Features.UserManagement.Commands.UpdateUser;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("User ID must be a positive number");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(255).WithMessage("Email cannot exceed 255 characters")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.Name)
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Role)
            .MaximumLength(50).WithMessage("Role cannot exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Role));

        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("Department ID must be a positive number")
            .When(x => x.DepartmentId.HasValue);
    }
}
