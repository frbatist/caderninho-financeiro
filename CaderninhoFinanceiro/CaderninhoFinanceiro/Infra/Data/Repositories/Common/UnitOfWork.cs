using CaderninhoFinanceiro.Domain.Repositories.Common;

namespace CaderninhoFinanceiro.Infra.Data.Repositories.Common
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _dbContext;

        public UnitOfWork(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public ApplicationDbContext Context => _dbContext;

        public Task SaveChanges()
        {
            return _dbContext.SaveChangesAsync();
        }
    }
}
