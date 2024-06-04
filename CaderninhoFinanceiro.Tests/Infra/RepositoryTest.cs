using CaderninhoFinanceiro.Domain.Entities;
using CaderninhoFinanceiro.Domain.Repositories.Common;
using CaderninhoFinanceiro.Infra.Data;
using CaderninhoFinanceiro.Infra.Data.Repositories.Common;
using FluentAssertions;

namespace CaderninhoFinanceiro.Tests.Infra
{
    public class RepositoryTest : IClassFixture<SqliteContextHelper>
    {
        private readonly SqliteContextHelper _contextHelper;
        private readonly ApplicationDbContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRepository<User, string> _repository;

        public RepositoryTest(SqliteContextHelper contextHelper)
        {
            _contextHelper = contextHelper;
            _context = _contextHelper.GetContext();
            _unitOfWork = new UnitOfWork(_context);
            _repository = new Repository<User, string>(_unitOfWork);
        }

        [Fact]
        public async Task Add_ShoudAddNewEntityInstanceToRepository()
        {
            //Arrange
            var user = new User
            {
                UserName = "Test",
                Email = "lazarento@teste.com"
            };

            //Act
            _repository.Add(user);
            await _unitOfWork.SaveChanges();

            //Assert
            var persistedUser = await _context.Set<User>().FindAsync(user.Id);
            persistedUser.Should().BeEquivalentTo(user);

        }

        [Fact]
        public async Task Delete_ShoudRemoveEntityInstanceFromRepository()
        {
            //Arrange
            var user = new User
            {
                UserName = "Test",
                Email = "lazarento@teste.com"
            };
            _context.Set<User>().Add(user);
            _context.SaveChanges();

            //Act
            _repository.Delete(user);
            await _unitOfWork.SaveChanges();

            //Assert
            var deletedUser = await _context.Set<User>().FindAsync(user.Id);
            deletedUser.Should().BeNull();

        }

        [Fact]
        public async Task Delete_ShoudRemoveEntityInstanceFromRepositoryById()
        {
            //Arrange
            var user = new User
            {
                UserName = "Test",
                Email = "lazarento@teste.com"
            };
            _context.Set<User>().Add(user);
            _context.SaveChanges();

            //Act
            await _repository.Delete(user.Id);
            await _unitOfWork.SaveChanges();

            //Assert
            var deletedUser = await _context.Set<User>().FindAsync(user.Id);
            deletedUser.Should().BeNull();
        }

        [Fact]
        public async Task GetById_ShouldReturnRowById()
        {
            //Arrange
            var user = new User
            {
                UserName = "Test",
                Email = "lazarento@teste.com"
            };
            _context.Set<User>().Add(user);
            _context.SaveChanges();

            //Act
            var persistedUser = await _repository.GetById(user.Id);

            //AssertAdd rep
            persistedUser.Should().NotBeNull();
            persistedUser.Should().BeEquivalentTo(user);
        }
    }
}
