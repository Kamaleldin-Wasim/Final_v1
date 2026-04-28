using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NoSmokeJourney.Core.Interfaces;
using NoSmokeJourney.Infrastructure.Data;
using NoSmokeJourney.Infrastructure.Data.Seed;
using NoSmokeJourney.Infrastructure.Repositories;
using NoSmokeJourney.Services.Implementations;
using NoSmokeJourney.Services.Interfaces;
using NoSmokeJourney.Services.Mappings;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "No Smoke Journey API",
        Version = "v1",
        Description = "Backend API for No Smoke Journey - Smoking Awareness Platform",
        Contact = new OpenApiContact
        {
            Name = "No Smoke Journey Team",
            Email = "support@nosmokejourney.com"
        }
    });

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Configure AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "NoSmokeJourney",
        ValidAudience = jwtSettings["Audience"] ?? "NoSmokeJourneyUsers",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// Configure Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("UserOnly", policy => policy.RequireRole("User"));
    options.AddPolicy("DoctorOnly", policy => policy.RequireRole("Doctor"));
});

// Register Repositories
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISmokerService, SmokerService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IMedicalCenterService, MedicalCenterService>();
builder.Services.AddScoped<ISeminarService, SeminarService>();
builder.Services.AddScoped<IRecoveryStoryService, RecoveryStoryService>();
builder.Services.AddScoped<IDoctorReviewService, DoctorReviewService>();
builder.Services.AddScoped<IAddictionTestService, AddictionTestService>();
builder.Services.AddScoped<ICancerRiskService, CancerRiskService>();
builder.Services.AddScoped<IProgressTrackerService, ProgressTrackerService>();
builder.Services.AddScoped<IEducationalContentService, EducationalContentService>();
builder.Services.AddScoped<IHealthMilestoneService, HealthMilestoneService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "No Smoke Journey API v1");
        options.RoutePrefix = "swagger";
    });
}

// CORS — kept as safety net (not strictly needed for same-origin setup)
app.UseCors("AllowAll");

// Serve frontend static files from wwwroot
app.UseDefaultFiles(); // Serves index.html for /
app.UseStaticFiles();  // Serves CSS, JS, images, etc.

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Fallback: serve index.html for unmatched routes (SPA support)
app.MapFallbackToFile("index.html");

// Ensure database is created and migrated
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        dbContext.Database.EnsureCreated();
        Console.WriteLine("Database created successfully.");

        // Seed initial data
        DbInitializer.Seed(dbContext);
        Console.WriteLine("Database seeded successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred while migrating the database: {ex.Message}");
    }
}

app.Run();
