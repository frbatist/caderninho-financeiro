using CaderninhoFinanceiro.Domain.Repositories.Common;
using Microsoft.EntityFrameworkCore;

namespace CaderninhoFinanceiro.Infra.Data.Repositories.Common
{
    public class Repository<TEntity, TKey> : IRepository<TEntity, TKey> where TEntity : class, IEntity<TKey>
    {
        protected readonly ApplicationDbContext Context;
        protected readonly DbSet<TEntity> DbSet;

        public Repository(IUnitOfWork unitOfWork)
        {
            Context = unitOfWork.Context;
            DbSet = Context.Set<TEntity>();
        }

        public void Add(TEntity entity)
        {
            DbSet.Add(entity);
        }

        public Task Delete(TKey id)
        {
            if (id == null) throw new ArgumentNullException("id");
            return DbSet.Where(d => d.Id.Equals(id)).ExecuteDeleteAsync();
        }

        public void Delete(TEntity entity)
        {
            DbSet.Remove(entity);
        }

        public ValueTask<TEntity?> GetByIdAsync(TKey id)
        {
            return DbSet.FindAsync(id);
        }
    }
}
