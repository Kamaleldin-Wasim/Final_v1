using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NoSmokeJourney.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FirstMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EducationalContents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    ContentUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BodyOrgan = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ViewCount = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EducationalContents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HealthMilestones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeAfterQuit = table.Column<TimeSpan>(type: "time", nullable: false),
                    IconUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Benefits = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthMilestones", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MedicalCenters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Specialization = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactInfo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalCenters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Seminars",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Time = table.Column<TimeSpan>(type: "time", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Speaker = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MaxAttendees = table.Column<int>(type: "int", nullable: false),
                    CurrentAttendees = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Seminars", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProfileImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiryTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Doctors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Specialization = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rating = table.Column<double>(type: "float", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactInfo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    About = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MedicalCenterId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Doctors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Doctors_MedicalCenters_MedicalCenterId",
                        column: x => x.MedicalCenterId,
                        principalTable: "MedicalCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Doctors_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecoveryStories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhotoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ViewCount = table.Column<int>(type: "int", nullable: false),
                    ApprovedByAdminId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecoveryStories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecoveryStories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SeminarRegistrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SeminarId = table.Column<int>(type: "int", nullable: false),
                    RegistrationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SeminarRegistrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SeminarRegistrations_Seminars_SeminarId",
                        column: x => x.SeminarId,
                        principalTable: "Seminars",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SeminarRegistrations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Smokers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    Gender = table.Column<int>(type: "int", nullable: false),
                    CigarettesPerDay = table.Column<int>(type: "int", nullable: false),
                    YearsOfSmoking = table.Column<int>(type: "int", nullable: false),
                    MedicalHistory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FamilyDiseases = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreviousQuitAttempts = table.Column<int>(type: "int", nullable: true),
                    QuitDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CigarettePrice = table.Column<double>(type: "float", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Smokers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Smokers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DoctorReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReviewDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsVisible = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorReviews_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DoctorReviews_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AddictionTests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SmokerId = table.Column<int>(type: "int", nullable: false),
                    Question1Score = table.Column<int>(type: "int", nullable: false),
                    Question2Score = table.Column<int>(type: "int", nullable: false),
                    Question3Score = table.Column<int>(type: "int", nullable: false),
                    Question4Score = table.Column<int>(type: "int", nullable: false),
                    Question5Score = table.Column<int>(type: "int", nullable: false),
                    Question6Score = table.Column<int>(type: "int", nullable: false),
                    TotalScore = table.Column<int>(type: "int", nullable: false),
                    AddictionLevel = table.Column<int>(type: "int", nullable: false),
                    Advice = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TestDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AddictionTests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AddictionTests_Smokers_SmokerId",
                        column: x => x.SmokerId,
                        principalTable: "Smokers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CancerRiskAssessments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SmokerId = table.Column<int>(type: "int", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    CigarettesPerDay = table.Column<int>(type: "int", nullable: false),
                    YearsOfSmoking = table.Column<int>(type: "int", nullable: false),
                    HasFamilyHistory = table.Column<bool>(type: "bit", nullable: false),
                    HasPersistentCough = table.Column<bool>(type: "bit", nullable: false),
                    HasChestPain = table.Column<bool>(type: "bit", nullable: false),
                    HasShortnessOfBreath = table.Column<bool>(type: "bit", nullable: false),
                    HasBloodInCough = table.Column<bool>(type: "bit", nullable: false),
                    HasUnexplainedWeightLoss = table.Column<bool>(type: "bit", nullable: false),
                    RiskLevel = table.Column<int>(type: "int", nullable: false),
                    RiskPercentage = table.Column<double>(type: "float", nullable: false),
                    Recommendations = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AssessmentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CancerRiskAssessments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CancerRiskAssessments_Smokers_SmokerId",
                        column: x => x.SmokerId,
                        principalTable: "Smokers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProgressTrackers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SmokerId = table.Column<int>(type: "int", nullable: false),
                    QuitDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CigarettesAvoided = table.Column<int>(type: "int", nullable: false),
                    MoneySaved = table.Column<double>(type: "float", nullable: false),
                    HealthTimeRegained = table.Column<int>(type: "int", nullable: false),
                    HealthAge = table.Column<int>(type: "int", nullable: true),
                    Reached20Minutes = table.Column<bool>(type: "bit", nullable: false),
                    Reached12Hours = table.Column<bool>(type: "bit", nullable: false),
                    Reached24Hours = table.Column<bool>(type: "bit", nullable: false),
                    Reached48Hours = table.Column<bool>(type: "bit", nullable: false),
                    Reached1Week = table.Column<bool>(type: "bit", nullable: false),
                    Reached2Weeks = table.Column<bool>(type: "bit", nullable: false),
                    Reached1Month = table.Column<bool>(type: "bit", nullable: false),
                    Reached3Months = table.Column<bool>(type: "bit", nullable: false),
                    Reached6Months = table.Column<bool>(type: "bit", nullable: false),
                    Reached1Year = table.Column<bool>(type: "bit", nullable: false),
                    Reached5Years = table.Column<bool>(type: "bit", nullable: false),
                    Reached10Years = table.Column<bool>(type: "bit", nullable: false),
                    Reached15Years = table.Column<bool>(type: "bit", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgressTrackers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgressTrackers_Smokers_SmokerId",
                        column: x => x.SmokerId,
                        principalTable: "Smokers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AddictionTests_SmokerId",
                table: "AddictionTests",
                column: "SmokerId");

            migrationBuilder.CreateIndex(
                name: "IX_CancerRiskAssessments_SmokerId",
                table: "CancerRiskAssessments",
                column: "SmokerId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorReviews_DoctorId",
                table: "DoctorReviews",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorReviews_UserId",
                table: "DoctorReviews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_MedicalCenterId",
                table: "Doctors",
                column: "MedicalCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_UserId",
                table: "Doctors",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProgressTrackers_SmokerId",
                table: "ProgressTrackers",
                column: "SmokerId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecoveryStories_UserId",
                table: "RecoveryStories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SeminarRegistrations_SeminarId",
                table: "SeminarRegistrations",
                column: "SeminarId");

            migrationBuilder.CreateIndex(
                name: "IX_SeminarRegistrations_UserId_SeminarId",
                table: "SeminarRegistrations",
                columns: new[] { "UserId", "SeminarId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Smokers_UserId",
                table: "Smokers",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AddictionTests");

            migrationBuilder.DropTable(
                name: "CancerRiskAssessments");

            migrationBuilder.DropTable(
                name: "DoctorReviews");

            migrationBuilder.DropTable(
                name: "EducationalContents");

            migrationBuilder.DropTable(
                name: "HealthMilestones");

            migrationBuilder.DropTable(
                name: "ProgressTrackers");

            migrationBuilder.DropTable(
                name: "RecoveryStories");

            migrationBuilder.DropTable(
                name: "SeminarRegistrations");

            migrationBuilder.DropTable(
                name: "Doctors");

            migrationBuilder.DropTable(
                name: "Smokers");

            migrationBuilder.DropTable(
                name: "Seminars");

            migrationBuilder.DropTable(
                name: "MedicalCenters");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
