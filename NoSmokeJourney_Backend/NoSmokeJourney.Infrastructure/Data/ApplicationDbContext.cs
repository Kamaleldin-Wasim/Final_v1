using Microsoft.EntityFrameworkCore;
using NoSmokeJourney.Core.Entities;

namespace NoSmokeJourney.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Smoker> Smokers { get; set; }
    public DbSet<Doctor> Doctors { get; set; }
    public DbSet<MedicalCenter> MedicalCenters { get; set; }
    public DbSet<Seminar> Seminars { get; set; }
    public DbSet<SeminarRegistration> SeminarRegistrations { get; set; }
    public DbSet<RecoveryStory> RecoveryStories { get; set; }
    public DbSet<DoctorReview> DoctorReviews { get; set; }
    public DbSet<AddictionTest> AddictionTests { get; set; }
    public DbSet<CancerRiskAssessment> CancerRiskAssessments { get; set; }
    public DbSet<ProgressTracker> ProgressTrackers { get; set; }
    public DbSet<EducationalContent> EducationalContents { get; set; }
    public DbSet<HealthMilestone> HealthMilestones { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).IsRequired();
        });

        // Smoker Configuration
        modelBuilder.Entity<Smoker>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithOne(u => u.SmokerProfile)
                .HasForeignKey<Smoker>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.UserId).IsUnique();
        });

        // Doctor Configuration
        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithOne(u => u.DoctorProfile)
                .HasForeignKey<Doctor>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.MedicalCenter)
                .WithMany(mc => mc.Doctors)
                .HasForeignKey(e => e.MedicalCenterId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => e.UserId).IsUnique();
        });

        // Medical Center Configuration
        modelBuilder.Entity<MedicalCenter>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Location).IsRequired().HasMaxLength(300);
        });

        // Seminar Configuration
        modelBuilder.Entity<Seminar>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Location).IsRequired().HasMaxLength(300);
            entity.Property(e => e.Speaker).IsRequired().HasMaxLength(100);
        });

        // Seminar Registration Configuration
        modelBuilder.Entity<SeminarRegistration>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithMany(u => u.SeminarRegistrations)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Seminar)
                .WithMany(s => s.Registrations)
                .HasForeignKey(e => e.SeminarId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.UserId, e.SeminarId }).IsUnique();
        });

        // Recovery Story Configuration
        modelBuilder.Entity<RecoveryStory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithMany(u => u.RecoveryStories)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
        });

        // Doctor Review Configuration
        modelBuilder.Entity<DoctorReview>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithMany(u => u.DoctorReviews)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Doctor)
                .WithMany(d => d.Reviews)
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.Property(e => e.Rating).IsRequired();
        });

        // Addiction Test Configuration
        modelBuilder.Entity<AddictionTest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Smoker)
                .WithMany(s => s.AddictionTests)
                .HasForeignKey(e => e.SmokerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Cancer Risk Assessment Configuration
        modelBuilder.Entity<CancerRiskAssessment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Smoker)
                .WithMany(s => s.CancerRiskAssessments)
                .HasForeignKey(e => e.SmokerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Progress Tracker Configuration
        modelBuilder.Entity<ProgressTracker>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Smoker)
                .WithOne(s => s.ProgressTracker)
                .HasForeignKey<ProgressTracker>(e => e.SmokerId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.SmokerId).IsUnique();
        });

        // Educational Content Configuration
        modelBuilder.Entity<EducationalContent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ContentUrl).IsRequired();
        });

        // Health Milestone Configuration
        modelBuilder.Entity<HealthMilestone>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.DisplayOrder).IsRequired();
        });
    }
}
