using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace AppTemplate.Infrastructure.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        // We can map Context.UserIdentifier to a connection ID here if needed,
        // but default IUserIdProvider uses the NameIdentifier (sub/userId) claim which works with our JWT.
        await base.OnConnectedAsync();
    }
}
