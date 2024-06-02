using System.Security.Principal;

namespace CaderninhoFinanceiro.Domain.Repositories.Common
{
    /// <summary>
    /// Basic repository.
    /// </summary>
    /// <typeparam name="TEntity">Type of the entity.</typeparam>
    /// <typeparam name="TKey">Type of the entity Id</typeparam>
    public interface IRepository<TEntity, TKey> where TEntity : IEntity<TKey>
    {
        void Add(TEntity entity);
        Task Delete(TKey id);
        void Delete(TEntity entity);
        ValueTask<TEntity?> GetByIdAsync(TKey id);
    }
}
