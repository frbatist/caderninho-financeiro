namespace CaderninhoFinanceiro.Domain.Repositories.Common
{
    public interface IEntity<T>
    {
        public T Id { get; protected set; }
    }
}
