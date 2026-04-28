namespace NoSmokeJourney.Core.Entities;

public class ProgressTracker : BaseEntity
{
    public int SmokerId { get; set; }
    public Smoker Smoker { get; set; } = null!;

    public DateTime QuitDate { get; set; } 
    public int SmokeFreeDays => QuitDate > DateTime.MinValue ? (DateTime.UtcNow - QuitDate).Days : 0;
    public int CigarettesAvoided { get; set; }
    public double MoneySaved { get; set; }
    public int HealthTimeRegained { get; set; } // in minutes
    public int? HealthAge { get; set; }

    // Milestones
    public bool Reached20Minutes { get; set; }
    public bool Reached12Hours { get; set; }
    public bool Reached24Hours { get; set; }
    public bool Reached48Hours { get; set; }
    public bool Reached1Week { get; set; }
    public bool Reached2Weeks { get; set; }
    public bool Reached1Month { get; set; }
    public bool Reached3Months { get; set; }
    public bool Reached6Months { get; set; }
    public bool Reached1Year { get; set; }
    public bool Reached5Years { get; set; }
    public bool Reached10Years { get; set; }
    public bool Reached15Years { get; set; }

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
