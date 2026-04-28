using NoSmokeJourney.Core.Entities;
using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Infrastructure.Data.Seed;

public static class DbInitializer
{
    public static void Seed(ApplicationDbContext context)
    {
        // Seed Health Milestones
        if (!context.HealthMilestones.Any())
        {
            var milestones = new List<HealthMilestone>
            {
                new()
                {
                    Title = "20 Minutes",
                    Description = "Your heart rate and blood pressure drop to normal levels.",
                    TimeAfterQuit = TimeSpan.FromMinutes(20),
                    Benefits = "Reduced risk of heart attack begins immediately.",
                    DisplayOrder = 1,
                    IsActive = true
                },
                new()
                {
                    Title = "12 Hours",
                    Description = "Carbon monoxide levels in your blood drop to normal.",
                    TimeAfterQuit = TimeSpan.FromHours(12),
                    Benefits = "Your blood oxygen level increases to normal.",
                    DisplayOrder = 2,
                    IsActive = true
                },
                new()
                {
                    Title = "24 Hours",
                    Description = "Your risk of heart attack begins to decrease.",
                    TimeAfterQuit = TimeSpan.FromHours(24),
                    Benefits = "Heart attack risk starts to decline.",
                    DisplayOrder = 3,
                    IsActive = true
                },
                new()
                {
                    Title = "48 Hours",
                    Description = "Nerve endings start to regrow. Your sense of smell and taste improve.",
                    TimeAfterQuit = TimeSpan.FromHours(48),
                    Benefits = "Food tastes better, smells are more vivid.",
                    DisplayOrder = 4,
                    IsActive = true
                },
                new()
                {
                    Title = "1 Week",
                    Description = "Nicotine is completely eliminated from your body.",
                    TimeAfterQuit = TimeSpan.FromDays(7),
                    Benefits = "Withdrawal symptoms peak and begin to decrease.",
                    DisplayOrder = 5,
                    IsActive = true
                },
                new()
                {
                    Title = "2 Weeks",
                    Description = "Circulation improves and lung function increases.",
                    TimeAfterQuit = TimeSpan.FromDays(14),
                    Benefits = "Walking becomes easier, breathing improves.",
                    DisplayOrder = 6,
                    IsActive = true
                },
                new()
                {
                    Title = "1 Month",
                    Description = "Coughing and shortness of breath decrease.",
                    TimeAfterQuit = TimeSpan.FromDays(30),
                    Benefits = "Lung cilia regain normal function, reducing infection risk.",
                    DisplayOrder = 7,
                    IsActive = true
                },
                new()
                {
                    Title = "3 Months",
                    Description = "Circulation continues to improve significantly.",
                    TimeAfterQuit = TimeSpan.FromDays(90),
                    Benefits = "Reduced risk of heart attack and stroke.",
                    DisplayOrder = 8,
                    IsActive = true
                },
                new()
                {
                    Title = "6 Months",
                    Description = "Coughing, sinus congestion, and shortness of breath improve.",
                    TimeAfterQuit = TimeSpan.FromDays(180),
                    Benefits = "Lungs are much clearer, breathing is easier.",
                    DisplayOrder = 9,
                    IsActive = true
                },
                new()
                {
                    Title = "1 Year",
                    Description = "Your risk of coronary heart disease is half that of a smoker.",
                    TimeAfterQuit = TimeSpan.FromDays(365),
                    Benefits = "Heart disease risk reduced by 50%.",
                    DisplayOrder = 10,
                    IsActive = true
                },
                new()
                {
                    Title = "5 Years",
                    Description = "Stroke risk is reduced to that of a non-smoker.",
                    TimeAfterQuit = TimeSpan.FromDays(365 * 5),
                    Benefits = "Stroke risk equals that of a non-smoker.",
                    DisplayOrder = 11,
                    IsActive = true
                },
                new()
                {
                    Title = "10 Years",
                    Description = "Lung cancer death rate is about half that of a smoker.",
                    TimeAfterQuit = TimeSpan.FromDays(365 * 10),
                    Benefits = "Lung cancer risk reduced by 50%.",
                    DisplayOrder = 12,
                    IsActive = true
                },
                new()
                {
                    Title = "15 Years",
                    Description = "Risk of coronary heart disease is that of a non-smoker.",
                    TimeAfterQuit = TimeSpan.FromDays(365 * 15),
                    Benefits = "Heart disease risk equals that of a non-smoker.",
                    DisplayOrder = 13,
                    IsActive = true
                }
            };

            context.HealthMilestones.AddRange(milestones);
        }

        // Seed Educational Content
        if (!context.EducationalContents.Any())
        {
            var contents = new List<EducationalContent>
            {
                new()
                {
                    Title = "How Smoking Affects Your Lungs",
                    Description = "Learn about the devastating effects of smoking on your respiratory system.",
                    Type = ContentType.Article,
                    ContentUrl = "/content/lungs-article",
                    BodyOrgan = "lungs",
                    DisplayOrder = 1,
                    IsActive = true
                },
                new()
                {
                    Title = "Smoking and Heart Disease",
                    Description = "Understand the connection between smoking and cardiovascular health.",
                    Type = ContentType.Video,
                    ContentUrl = "/content/heart-video",
                    BodyOrgan = "heart",
                    DisplayOrder = 2,
                    IsActive = true
                },
                new()
                {
                    Title = "Effects on Your Brain",
                    Description = "Discover how nicotine affects your brain chemistry.",
                    Type = ContentType.Infographic,
                    ContentUrl = "/content/brain-infographic",
                    BodyOrgan = "brain",
                    DisplayOrder = 3,
                    IsActive = true
                },
                new()
                {
                    Title = "Smoking and Liver Function",
                    Description = "Learn how tobacco toxins stress your liver's detoxification processes.",
                    Type = ContentType.Article,
                    ContentUrl = "/content/liver-article",
                    BodyOrgan = "liver",
                    DisplayOrder = 4,
                    IsActive = true
                },
                new()
                {
                    Title = "Digestive Issues from Smoking",
                    Description = "Explore the link between smoking and stomach ulcers or GERD.",
                    Type = ContentType.Article,
                    ContentUrl = "/content/stomach-article",
                    BodyOrgan = "stomach",
                    DisplayOrder = 5,
                    IsActive = true
                },
                new()
                {
                    Title = "Renal Risks of Tobacco",
                    Description = "Smoking increases the risk of kidney cancer and chronic kidney disease.",
                    Type = ContentType.Infographic,
                    ContentUrl = "/content/kidneys-infographic",
                    BodyOrgan = "kidneys",
                    DisplayOrder = 6,
                    IsActive = true
                },
                new()
                {
                    Title = "Bladder Health Alert",
                    Description = "Carcinogens in tobacco are excreted through the bladder, raising cancer risk.",
                    Type = ContentType.Article,
                    ContentUrl = "/content/bladder-article",
                    BodyOrgan = "bladder",
                    DisplayOrder = 7,
                    IsActive = true
                }
            };

            context.EducationalContents.AddRange(contents);
        }

        // Seed Admin User
        if (!context.Users.Any(u => u.Email == "admin@nosmokejourney.com"))
        {
            var adminUser = new User
            {
                Name = "System Administrator",
                Email = "admin@nosmokejourney.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
        }

        // Seed Medical Centers
        if (!context.MedicalCenters.Any())
        {
            var centers = new List<MedicalCenter>
            {
                new() { Name = "Cairo Royal Hospital", Location = "Nasr City, Cairo", Description = "A premium government hospital with specialized lung care units.", Specialization = "government_hospital", ContactInfo = "+20 2 2345678" },
                new() { Name = "Hope Rehabilitation Center", Location = "Maadi, Cairo", Description = "Private clinic specialized in smoking cessation programs.", Specialization = "clinic", ContactInfo = "+20 10 99887766" },
                new() { Name = "Alexandria Advanced Labs", Location = "Smouha, Alexandria", Description = "State-of-the-art diagnostic laboratory.", Specialization = "lab", ContactInfo = "+20 3 5432100" }
            };
            context.MedicalCenters.AddRange(centers);
            context.SaveChanges();
        }

        // Seed Doctors
        if (!context.Doctors.Any())
        {
            var centerId = context.MedicalCenters.First().Id;
            var docUsers = new List<User>
            {
                new() { Name = "Dr. Ahmed Hassan", Email = "ahmed@hospital.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"), Role = UserRole.Doctor, IsActive = true },
                new() { Name = "Dr. Sara Mahmoud", Email = "sara@hospital.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"), Role = UserRole.Doctor, IsActive = true },
                new() { Name = "Dr. Mohamed Ali", Email = "mohamed@hospital.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"), Role = UserRole.Doctor, IsActive = true }
            };
            context.Users.AddRange(docUsers);
            context.SaveChanges();

            var doctors = new List<Doctor>
            {
                new() { UserId = docUsers[0].Id, Specialization = "Pulmonology", About = "Senior Pulmonologist with 15 years of experience in treating respiratory diseases.", MedicalCenterId = centerId, Location = "Nasr City, Cairo" },
                new() { UserId = docUsers[1].Id, Specialization = "Oncology", About = "Oncology consultant specialized in early lung cancer detection.", MedicalCenterId = centerId, Location = "Nasr City, Cairo" },
                new() { UserId = docUsers[2].Id, Specialization = "Smoking Cessation", About = "Helping thousands of patients quit smoking through behavioral therapy.", MedicalCenterId = centerId, Location = "Maadi, Cairo" }
            };
            context.Doctors.AddRange(doctors);
        }

        // Seed Seminars
        if (!context.Seminars.Any())
        {
            var seminars = new List<Seminar>
            {
                new() { Title = "Freedom from Tobacco", Description = "A comprehensive workshop on breaking the nicotine addiction cycle.", Date = DateTime.UtcNow.AddDays(7), Time = new TimeSpan(18, 0, 0), Location = "Cairo Royal Hall", Speaker = "Dr. Ahmed Hassan", MaxAttendees = 100, IsActive = true },
                new() { Title = "Lung Health & Early Detection", Description = "Interactive session about maintaining lung health and screening.", Date = DateTime.UtcNow.AddDays(14), Time = new TimeSpan(17, 30, 0), Location = "Online (Zoom)", Speaker = "Dr. Sara Mahmoud", MaxAttendees = 200, IsActive = true },
                new() { Title = "Modern Cessation Techniques", Description = "Exploring the latest medical and psychological aids for quitting.", Date = DateTime.UtcNow.AddDays(21), Time = new TimeSpan(19, 0, 0), Location = "Hope Center Maadi", Speaker = "Dr. Mohamed Ali", MaxAttendees = 30, IsActive = true }
            };
            context.Seminars.AddRange(seminars);
        }

        // Seed Recovery Stories
        if (!context.RecoveryStories.Any())
        {
            var adminId = context.Users.First(u => u.Role == UserRole.Admin).Id;
            var stories = new List<RecoveryStory>
            {
                new() { UserId = adminId, Title = "Clean Lungs, Clear Mind", Content = "After 20 years of smoking, I finally quit. The first month was hard, but now, 2 years later, I run marathons! You can do it too.", Status = StoryStatus.Approved, CreatedAt = DateTime.UtcNow.AddMonths(-1) },
                new() { UserId = adminId, Title = "For My Children", Content = "I quit for my kids. I want to see them grow up. LungCare helped me find the right doctor and support group.", Status = StoryStatus.Approved, CreatedAt = DateTime.UtcNow.AddMonths(-2) },
                new() { UserId = adminId, Title = "Better Late Than Never", Content = "I thought at 60 it was too late. I was wrong. My breathing improved within weeks. Don't wait!", Status = StoryStatus.Approved, CreatedAt = DateTime.UtcNow.AddDays(-15) }
            };
            context.RecoveryStories.AddRange(stories);
        }

        context.SaveChanges();
    }
}
