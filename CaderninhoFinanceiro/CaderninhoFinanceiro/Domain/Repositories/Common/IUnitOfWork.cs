using CaderninhoFinanceiro.Infra.Data;

namespace CaderninhoFinanceiro.Domain.Repositories.Common
{
    public interface IUnitOfWork
    {
        Task SaveChanges();
        ApplicationDbContext Context { get; }
    }
}
