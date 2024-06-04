using CaderninhoFinanceiro.Infra.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace CaderninhoFinanceiro.Tests.Infra
{
    public class SqliteContextHelper : IDisposable
    {
        private readonly SqliteConnection _connection;
        private readonly DbContextOptions<ApplicationDbContext> _contextOptions;
        private readonly ApplicationDbContext _context;

        public SqliteContextHelper()
        {
            _connection = new SqliteConnection("Filename=:memory:");
            _connection.Open();

            _contextOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection)
                .Options;

            _context = new ApplicationDbContext(_contextOptions);
            _context.Database.EnsureCreated();             
        }

        internal ApplicationDbContext GetContext()
        {
            return _context;
        }

        public void Dispose()
        {
            _context.Dispose();
            _connection.Dispose();
        }
    }
}
