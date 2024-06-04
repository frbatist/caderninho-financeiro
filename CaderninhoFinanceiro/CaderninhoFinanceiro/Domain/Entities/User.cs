using CaderninhoFinanceiro.Domain.Repositories.Common;
using Microsoft.AspNetCore.Identity;

namespace CaderninhoFinanceiro.Domain.Entities
{
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class User : IdentityUser, IEntity<string>
    {
    }
}
