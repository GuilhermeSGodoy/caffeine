using Caffeine.Domain;
using Microsoft.EntityFrameworkCore;

namespace Caffeine.Infrastructure;

public class CaffeineDbContext(DbContextOptions<CaffeineDbContext> options) : DbContext(options)
{
    public DbSet<Node> Nodes => Set<Node>();
    public DbSet<DocumentContent> DocumentContents => Set<DocumentContent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Node>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Title).IsRequired();
            entity.HasOne<Node>()
                .WithMany()
                .HasForeignKey(n => n.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(n => !n.IsDeleted);
        });

        modelBuilder.Entity<DocumentContent>(entity =>
        {
            entity.HasKey(d => d.NodeId);
            entity.Property(d => d.ContentJson).IsRequired();
            entity.HasOne<Node>()
                .WithOne()
                .HasForeignKey<DocumentContent>(d => d.NodeId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
