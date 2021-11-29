using System.Threading.Tasks;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace API.Helpers
{
    public class LogUserActivity : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context,
            ActionExecutionDelegate next)
        {
            var resultContext = await next();

            if(!resultContext.HttpContext.User.Identity.IsAuthenticated) return;

            var userId = resultContext.HttpContext.User.GetUserId();
            var serviceProvider = resultContext.HttpContext.RequestServices;
            var userRepository = serviceProvider.GetService<IUserRepository>();
            var user = await userRepository.GetUserById(userId);
            user.LastActive = System.DateTime.Now;
            await userRepository.SaveAllAsync();
        }
    }
}