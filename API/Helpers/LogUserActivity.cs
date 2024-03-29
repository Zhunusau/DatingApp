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
            var uow = serviceProvider.GetService<IUnitOfWork>();
            var user = await uow.UserRepository.GetUserById(userId);
            user.LastActive = System.DateTime.Now;
            await uow.Complete();
        }
    }
}